<?php
// mock missing Kanboard classes and interfaces for isolated plugin testing 

namespace Kanboard\Core\Filter {
    interface FormatterInterface {}
}

namespace Kanboard\Formatter {
    class BaseFormatter {
        public $container;
        public $query;
        public function __construct($container) {
            $this->container = $container;
        }
    }
}

namespace Kanboard\Controller {
    class BaseController {
        public $container;
        public function __construct($container = []) {
            $this->container = $container;
            // Dynamically assign all properties
            foreach ($container as $key => $value) {
                if (property_exists($this, $key) === false) {
                    $this->{$key} = $value;
                }
            }
        }

        // Mock getProject() since it's used by TaskGanttController
        public function getProject() {
            return ['id' => 1, 'name' => 'Demo Project'];
        }
    }
}
