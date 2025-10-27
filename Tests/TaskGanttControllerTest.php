<?php

namespace Kanboard\Plugin\DhtmlGantt\Tests;

use Kanboard\Plugin\DhtmlGantt\Controller\TaskGanttController;
require_once __DIR__.'/Mocks.php';

require_once __DIR__.'/BaseTestCase.php';
require_once __DIR__.'/../Controller/TaskGanttController.php';

class TaskGanttControllerTest extends \BaseTestCase
{
    public function testCreateLinkValid()
    {
        $this->container['request'] = new class {
            public function getJson() { return ['source' => 1, 'target' => 2]; }
        };

        $this->container['response'] = new class {
            public $status; public $payload;
            public function json($data, $status = 200) {
                $this->status = $status; $this->payload = $data;
            }
        };

        $controller = new TaskGanttController($this->container);
        $controller->taskLinkModel = new class {
            public function create($data) { return true; }
        };

        $controller->dependency();
        $this->assertSame(200, $controller->response->status);
        $this->assertSame('ok', $controller->response->payload['result']);
    }

    public function testCreateLinkInvalid()
    {
        $this->container['request'] = new class {
            public function getJson() { return ['source' => null, 'target' => null]; }
        };

        $this->container['response'] = new class {
            public $status; public $payload;
            public function json($data, $status = 400) {
                $this->status = $status; $this->payload = $data;
            }
        };

        $controller = new TaskGanttController($this->container);
        $controller->dependency();
        $this->assertSame(400, $controller->response->status);
    }

    public function testRemoveDependency()
{
    // Mock request with getStringParam()
    $this->container['request'] = new class {
        public $data = [];
        public function getJson() { return $this->data; }
        public function setJson($data) { $this->data = $data; }
        public function getStringParam($key) {
            return $this->data[$key] ?? null;
        }
    };

    // Mock response
    $this->container['response'] = new class {
        public $status;
        public $payload;
        public function json($data, $status = 200) {
            $this->status = $status;
            $this->payload = $data;
        }
    };

    $controller = new TaskGanttController($this->container);
    $controller->taskLinkModel = new class {
        public function remove($id) { return true; }
    };

    // Set mock request JSON
    $this->container['request']->setJson(['id' => 123]);

    $controller->removeDependency();

    $this->assertSame(200, $this->container['response']->status);
    $this->assertSame('ok', $this->container['response']->payload['result']);
}

}
