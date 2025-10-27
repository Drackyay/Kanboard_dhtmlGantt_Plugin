<?php
// Mock Kanboard model classes if not loaded 
namespace Kanboard\Model {
    class TaskModel {
        public function create($data = []) {
            return rand(1, 1000);
        }

        public function getQuery() {
            return new class {
                private $tasks = [];
                public function addTask($task) { $this->tasks[] = $task; }
                public function findAll() { return $this->tasks; }
            };
        }
    }

    class ProjectModel {
        public function create($data = []) {
            return rand(1, 1000);
        }
    }

    class SubtaskModel {}

    class TaskLinkModel {
        private $links = [];

        public function create($data) {
            $data['id'] = rand(1000, 9999);
            $this->links[] = $data;
            return $data['id'];
        }

        public function getAll($taskId) {
            return array_filter($this->links, fn($l) =>
                $l['task_id'] === $taskId || $l['opposite_task_id'] === $taskId
            );
        }
    }
}


//Return to global namespace for PHPUnit base class
namespace {
    use PHPUnit\Framework\TestCase;

    abstract class BaseTestCase extends TestCase
    {
        protected $container = [];

        protected function setUp(): void
        {
            // Mock Kanboard dependency injection container
            $this->container = [
                'taskModel'      => new \Kanboard\Model\TaskModel(),
                'projectModel'   => new \Kanboard\Model\ProjectModel(),
                'subtaskModel'   => new \Kanboard\Model\SubtaskModel(),
                'taskLinkModel'  => new \Kanboard\Model\TaskLinkModel(),
                'taskFinderModel'=> new class {
                    public function findAll() {
                        return [
                            ['id' => 1, 'title' => 'Task A', 'date_started' => '2025-01-01', 'date_due' => '2025-01-05'],
                            ['id' => 2, 'title' => 'Task B', 'date_started' => '2025-01-02', 'date_due' => '2025-01-06'],
                        ];
                    }
                },
            ];
        }

        protected function tearDown(): void
        {
            $this->container = [];
        }

        protected function createTask(array $overrides = []): array
        {
            return array_merge([
                'id' => rand(100, 999),
                'title' => 'Sample Task',
                'date_started' => time(),
                'date_due' => time() + 86400,
                'priority' => 1,
                'is_active' => 1,
            ], $overrides);
        }

        protected function createLink(int $taskId, int $oppositeTaskId, int $type = 1): array
        {
            return [
                'id' => rand(1000, 9999),
                'task_id' => $taskId,
                'opposite_task_id' => $oppositeTaskId,
                'link_id' => $type,
            ];
        }
    }
}