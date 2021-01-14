const {each, includes, dom, values} = require('../util');
const event = require('../core/event');
const store = require('../core/store');
const allsettings = require('../core/settings');
const base = require('./base');

const paginationItems = [100, 0, 50, 250, 500];
const settings = Object.assign({
    paginationItems,
    hideParentFolder: false,
}, allsettings.view);
const defaultSize = settings.paginationItems.length ? settings.paginationItems[0] : 0;
const sortedSizes = [...new Set(settings.paginationItems)].sort((a, b) => a - b)
const storekey = 'pagination';
const paginationTpl =
        `<div id="pagination_btm" class="pagination">
            <div id="nav_btm" class="nav_buttons"></div>
        </div>`;
const selectorTpl =
        `<div id="pag_sidebar" class="block">
        <h1 class="l10n-pagination">Pagination</h1>
            <form id="pag_form">
                <select id="pag_select" name='Pagination size'>
                </select>
                <noscript><input type="submit" value="Submit"></noscript>
            </form>
        </div>`;
const $pagination = dom(paginationTpl);
const btn_cls = {
    'btn_first': '<<',
    'btn_prev': '<',
    'btn_next': '>',
    'btn_last': '>>'
};

let pag_active = false;
let pag_buttons = [];
let pag_current_page = 1;
let pag_items;
let pag_payload;
let pag_view;
let pag_count = 0;
let pag_parent_folder;
let pag_rows_pref;
let sortfn;

const setup = (items) => {
    updateItems(items);
    pag_current_page = 1;
    pag_buttons = [];
    let $pagination_els = base.$content.find('.nav_buttons');
    setupNavigation($pagination_els);
    pag_active = true;
    updateSortFunc();
    sort(sortfn());
    setCurrentPage(1);
}

const updateSortFunc = () => {
    // Lazy load because sort module needs us loaded beforehand
    sortfn = require('../ext/sort').getSortFunc;
}

const updateItems = (items) => {
    if (!items){
        return;  // use cached items instead
    }
    pag_items = items;
    popParentFolder(pag_items);
    totalPages();
    return;
}

const clear = () => {
    if (pag_active){
        pag_buttons.forEach(e => e.remove());
        pag_buttons = [];
    }
    pag_active = false;
}

const isActive = () => {
    return pag_active;
}

const totalPages = () => {
    if (pag_rows_pref == 0){  // ALL
        return pag_count = 1;
    }
    pag_count = Math.ceil(pag_items.length / pag_rows_pref);
    return pag_count;
}

const popParentFolder = (items) => {
    if (items.length > 0 && !settings.hideParentFolder){
        pag_parent_folder = items.shift();
        return;
    }
    pag_parent_folder = undefined;
}

const pushParentFolder = (items) => {
    if (pag_parent_folder && items[0] !== pag_parent_folder) {
        items.unshift(pag_parent_folder);
    }
}

const setCurrentPage = (page) => {
    if (!page) {
        page = (pag_current_page <= pag_count) ? pag_current_page : pag_count;
    }
    pag_current_page = page;

    const paginatedItems = computeSlice(pag_items, page, pag_rows_pref);

    pushParentFolder(paginatedItems);

    updateButtons();
    if (pag_count <= 1) {
        base.$content.find('.nav_buttons').addCls('hidden');
        pag_active = false;
    } else {
        base.$content.find('.nav_buttons').rmCls('hidden');
        pag_active = true;
    }
    pag_view.doSetItems(paginatedItems);
}

const computeSlice = (items, page, rows_per_page) => {
    if (!rows_per_page) { // ALL
        return items;
    }
    page--;
    const start = rows_per_page * page;
    const end = start + rows_per_page;
    return items.slice(start, end);
}

const sort = (fn) => {
    // We don't need parent folder item, so we don't filterPayload()
    pag_items = values(pag_payload.content).sort(fn);
}

const setupNavigation = (container) => {
    each(container, key => {
        key.innerHTML = "";
    });

    each(container, el => {
        for (let key in btn_cls) {
            const btn = paginationButton(key, btn_cls[key]);
            el.appendChild(btn);
            pag_buttons.push(btn);
        }
    });

    each(container, key => {
        // Page status numbers
        let div = updatePageStatus(null);
        key.insertBefore(div, key.childNodes[2]);
        pag_buttons.push(div);

        // Manual page number selection
        div = document.createElement('div');
        div.classList.add('page_input');
        let {input_field, input_btn} = pageInputForm();
        div.appendChild(input_field);
        div.appendChild(input_btn);
        key.appendChild(div);
        pag_buttons.push(input_field);
        pag_buttons.push(input_btn);
    });
}

const paginationButton = (classname, arrow) => {
	const button = document.createElement('button');
    button.innerText = arrow;
    button.classList.add('nav_button');

    button.id = classname;

    switch (classname) {
        case 'btn_prev':
            button.req_page = () => pag_current_page - 1;
            button.disabled = true;
            break;
        case 'btn_next':
            button.req_page = () => pag_current_page + 1;
            button.disabled = false;
            break;
        case 'btn_last':
            button.req_page = () => pag_count;
            button.disabled = false;
            break;
        default: // 'btn_first'
            button.req_page = () => 1;
            button.disabled = true;
	}
	button.addEventListener('click', function() {
		setCurrentPage(this.req_page());
	});
	return button;
};

const updateButtons = () => {
    const prev_buttons =  dom('#btn_first, #btn_prev');
    const next_buttons =  dom('#btn_next, #btn_last');
    if (pag_current_page <= 1) {
        each(prev_buttons, button => button.disabled = true);
        each(next_buttons, button => button.disabled = false);
    } else if (pag_current_page >= pag_count && pag_current_page > 1) {
        each(next_buttons, button => button.disabled = true);
        each(prev_buttons, button => button.disabled = false);
    } else {
        const nav_buttons = dom('#btn_first, #btn_prev, #btn_next, #btn_last');
        each(nav_buttons, button => button.disabled = false);
    }
    const pag_pos = dom('.pag_pos');
    each(pag_pos, el => updatePageStatus(el));
}

const updatePageStatus = (div) => {
    const status = pag_current_page.toString().concat('/', pag_count.toString());
    if (!div) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(status));
        div.classList.add('pag_pos');
        return div;
    }
    return div.innerText = status;
}

const pageInputForm = () => {
    const input_field = document.createElement('input');
    input_field.type = 'text';
    // Use title instead of placeholder due to some translations not fitting in
    input_field.classList.add('l10n_title-pagInputTxt'); // input_field.title = 'page';
    input_field.placeholder = '...';

    const input_btn = document.createElement('input');
    input_btn.type = 'button';
    input_btn.classList.add('l10n_val-pagInputBtn'); // input_btn.value = 'GO';

    input_btn.addEventListener('click', () => {
        if (input_field.value !== '' && input_field.value !== pag_current_page) {
            let parsed = parseInt(input_field.value, 10);
            if (!isNaN(parsed)) {
                setCurrentPage(parsed);
            }
        }
        input_field.value = "";
        input_field.focus();
    });

    input_field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input_field.value && /[^\s]/.test(input_field.value)) {
            if (input_field.value !== pag_current_page) {
                e.preventDefault();
                let parsed = parseInt(input_field.value, 10);
                if (!isNaN(parsed) && parsed !== pag_current_page) {
                    setCurrentPage(parsed);
                }
            }
            input_field.value = "";
            input_field.focus();
        };
    });

    // Only allow digits, new line and max page, no leading zero or spaces
    setInputFilter(input_field, (value) => {
        return /^[^0\s][\d]*$/.test(value) && value <= pag_count;
    });

    return {input_field, input_btn};
}

// Restricts input for the given textbox to the given inputFilter function.
// In the future we could use beforeinput instead.
function setInputFilter(textbox, inputFilter) {
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select",
    "contextmenu", "drop"].forEach(function(event) {
        textbox.addEventListener(event, function(e) {
            if (this.value === '') {
                this.oldValue = this.value;
            }
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    });
}

const initPagSelector = () => {
    if (settings.paginationItems.length > 0) {
        dom(selectorTpl).appTo('#sidebar');

        document.querySelector('#pag_select')
            .addEventListener('change', onSelect);

        for (let option of addOptions(getCachedPref())) {
            option.appTo('#pag_select');
        }
    }
};

function onSelect() {
    setPref(parseInt(this.value, 10));
    onPagPrefUpdated();
}

const addOptions = (cached_pref) => {
    const options = [];
    let set_default = false;
    for (let size of sortedSizes) {
        let element;
        if (size === cached_pref && !set_default) {
            element = dom(`<option selected value="${size}"></option>`);
            set_default = true;
        } else {
            element = dom(`<option value="${size}"></option>`);
        }
        element.addCls((size === 0) ? 'l10n-displayAll' : 'l10n_rp-perPage');
        options.push(element);
    }
    return options;
}

const onLocationChanged = () => {
    // Workaround to append this to the sidebar at the last position
    // since the view module includes us before the other extensions
    if (dom('#pag_select').length === 0) {
        initPagSelector();
    }
}

const setPayload = (payload) => {
    // Not a copy, but we probably won't alter it anyway.
    pag_payload = payload;
}

const getCachedPref = () => {
    if (pag_rows_pref === undefined)
        return defaultSize;
    return pag_rows_pref;
};

// The module won't work if a view is not set first. We need to reuse some funcs
const setView = (view) => {
    pag_view = view;
}

const canHandle = (items) => {
    clear();
    if (items.length > getCachedPref()) {
        // Probably won't alter it, so we don't make a copy to save memory.
        setup(items);
        return true;
    }
    return false;
}

const isSortHandled = (fn) => {
    if (!pag_active) {
        return false;
    }
    sort(fn);
    setCurrentPage();
    return true;
}

const onPagPrefUpdated = () => {
    if (pag_active) {
        totalPages();
        setCurrentPage();
        return;
    }
    const pref =  getCachedPref();
    if (values(pag_payload.content).length > pref && pref != 0) {
        setup(pag_view.filterPayload(pag_payload));
    }
}

const isRefreshHandled = (item) => {
    setPayload(item);
    // Block if pagination is active
    if (values(item.content).length > getCachedPref()) {
        if (pag_active){
            updateItems(pag_view.filterPayload(item));
            sort(sortfn());  // initial sort
            setCurrentPage();
            return true;
        }
        setup(pag_view.filterPayload(item));
        return true;
    }
    // No need for pagination, recreate the items, hide & pass to default logic
    if (pag_active){
        updateItems(pag_view.filterPayload(item));
        setCurrentPage(1);
        clear();
        return true;
    }
    // We are not interested in handling the items
    return false;
}

const setPref = (size) => {
	const stored = store.get(storekey);
    size = (size !== undefined) ? size : stored ? stored : defaultSize;
    size = includes(settings.paginationItems, size) ? size : defaultSize;
    store.put(storekey, size);
    pag_rows_pref = size;
}

const init = () => {
    setPref();
    event.sub('location.changed', onLocationChanged);
};

init();

module.exports = {
	$el: $pagination,
    canHandle,
    isActive,
    isRefreshHandled,
    isSortHandled,
    setPayload,
    setView
}
