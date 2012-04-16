		<!-- generated code ends here -->
	</div>
	<div id="data-generic-json" class="hidden">
		<?php if (stripos($_SERVER["REQUEST_METHOD"], "HEAD") === false) {
			require_once(str_replace("\\", "/", __DIR__) . "/php/inc/H5ai.php");
			$h5ai = new H5ai();
			echo $h5ai->getGenericJson();
		} ?>
	</div>
</body>
</html>