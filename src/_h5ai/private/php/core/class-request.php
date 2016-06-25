<?php

class Request {
    private $params;

    public function __construct($params, $body) {
        $data = json_decode($body, true);
        $this->params = $data !== null ? $data : $params;
    }

    public function query($keypath = '', $default = Util::NO_DEFAULT) {
        $value = Util::array_query($this->params, $keypath, Util::NO_DEFAULT);

        if ($value === Util::NO_DEFAULT) {
            Util::json_fail(Util::ERR_MISSING_PARAM, 'parameter \'' . $keypath . '\' is missing', $default === Util::NO_DEFAULT);
            return $default;
        }

        return $value;
    }

    public function query_boolean($keypath = '', $default = Util::NO_DEFAULT) {
        $value = $this->query($keypath, $default);
        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    public function query_numeric($keypath = '', $default = Util::NO_DEFAULT) {
        $value = $this->query($keypath, $default);
        Util::json_fail(Util::ERR_ILLIGAL_PARAM, 'parameter \'' . $keypath . '\' is not numeric', !is_numeric($value));
        return intval($value, 10);
    }

    public function query_array($keypath = '', $default = Util::NO_DEFAULT) {
        $value = $this->query($keypath, $default);
        Util::json_fail(Util::ERR_ILLIGAL_PARAM, 'parameter \'' . $keypath . '\' is no array', !is_array($value));
        return $value;
    }
}
