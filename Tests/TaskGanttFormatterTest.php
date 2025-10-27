<?php

namespace Kanboard\Plugin\DhtmlGantt\Tests;

use Kanboard\Plugin\DhtmlGantt\Formatter\TaskGanttFormatter;

require_once __DIR__ . '/Mocks.php';
require_once __DIR__ . '/BaseTestCase.php';
require_once __DIR__ . '/../Formatter/TaskGanttFormatter.php';

class TaskGanttFormatterTest extends \BaseTestCase
{
    private function getMockFormatter(): TaskGanttFormatter
    {
        $formatter = new TaskGanttFormatter($this->container);
    
        // Mock for taskFinderModel
        $formatter->taskFinderModel = new class {
            public function findAll() {
                return [
                    ['id' => 1, 'title' => 'Task A', 'date_started' => '2025-01-01', 'date_due' => '2025-01-05'],
                    ['id' => 2, 'title' => 'Task B', 'date_started' => '2025-01-02', 'date_due' => '2025-01-06'],
                ];
            }
        };
    
        // Mock for taskLinkModel
        $formatter->taskLinkModel = new class {
            public function getAll($taskId) {
                return [
                    ['id' => 1, 'link_id' => 1, 'opposite_task_id' => 2],
                    ['id' => 2, 'link_id' => 2, 'opposite_task_id' => 3],
                ];
            }
        };
    
        return $formatter;
    }
    

    public function testFormatBasicTasks()
    {
        $formatter = new TaskGanttFormatter($this->container);
        $formatter->taskFinderModel = new class {
            public function findAll() {
                return [
                    ['id' => 1, 'title' => 'Task A', 'date_started' => strtotime('2025-01-01'), 'date_due' => strtotime('2025-01-05')],
                ];
            }
        };
        $formatter->taskLinkModel = new class {
            public function getAll($taskId) { return []; }
        };
    
        $result = $formatter->format();
    
        $this->assertNotEmpty($result['data'], 'Expected non-empty data array');
        $this->assertEquals('Task A', $result['data'][0]['text']);
        $this->assertCount(2, $result['data']);
    }
    

    private function callPrivateMethod($object, string $methodName, array $args = [])
    {
        $ref = new \ReflectionClass($object);
        $method = $ref->getMethod($methodName);
        $method->setAccessible(true);
        return $method->invokeArgs($object, $args);
    }

    public function testFormatLinksChildOf()
    {
        $formatter = $this->getMockFormatter();
        $links = $this->callPrivateMethod($formatter, 'formatLinks', [
            [
                ['id' => 1, 'link_id' => 1, 'opposite_task_id' => 2],
            ]
        ]);
        $this->assertIsArray($links);
    }

    public function testFormatLinksBlocks()
    {
        $formatter = $this->getMockFormatter();
        $links = $this->callPrivateMethod($formatter, 'formatLinks', [
            [
                ['id' => 1, 'link_id' => 2, 'opposite_task_id' => 3],
            ]
        ]);
        $this->assertIsArray($links);
    }
}

