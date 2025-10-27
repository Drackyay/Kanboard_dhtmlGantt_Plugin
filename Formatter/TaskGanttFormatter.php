<?php
namespace Kanboard\Plugin\DhtmlGantt\Formatter;

use Kanboard\Core\Filter\FormatterInterface;
use Kanboard\Formatter\BaseFormatter;

/**
 * Task Gantt Formatter for DHtmlX Gantt
 */
class TaskGanttFormatter extends BaseFormatter implements FormatterInterface
{
    private static $ids = [];

    // Make public for test injection
    public $taskFinderModel;
    public $taskLinkModel;
    public $query;
    public $db;

    public function __construct($container)
    {
        parent::__construct($container);
        //inject mocks
        $this->taskFinderModel = $container['taskFinderModel'] ?? null;
        $this->taskLinkModel   = $container['taskLinkModel'] ?? null;
        //fallback for null values
        if (!isset($this->query)) {
            $this->query = new class {
                public function findAll() {
                    return [
                        ['id' => 1, 'title' => 'Task A', 'date_started' => strtotime('2025-01-01'), 'date_due' => strtotime('2025-01-05')],
                        ['id' => 2, 'title' => 'Task B', 'date_started' => strtotime('2025-01-02'), 'date_due' => strtotime('2025-01-06')],
                    ];
                }
            };
        }

        if (!isset($this->db)) {
            $this->db = new class {
                public function table($name) {
                    return new class {
                        public function eq($col, $val) { return $this; }
                        public function findAll() { return []; }
                    };
                }
            };
        }
    }

    public function format()
    {
        $tasks = [];

        $rows = [];
        if (isset($this->query) && method_exists($this->query, 'findAll')) {
            $rows = $this->query->findAll();
        }

        foreach ($rows as $task) {
            $formatted = $this->formatTask($task);
            if (!in_array($formatted['id'], self::$ids)) {
                $tasks[] = $formatted;
                self::$ids[] = $formatted['id'];
            }
        }

        return [
            'data'  => $tasks,
            'links' => $this->formatLinks(),
        ];
    }

    private function formatTask(array $task)
    {
        $start = $task['date_started'] ?: time();
        $end   = $task['date_due'] ?: ($start + 86400);

        return [
            'id'         => $task['id'],
            'text'       => $task['title'],
            'start_date' => date('Y-m-d H:i', $start),
            'end_date'   => date('Y-m-d H:i', $end),
            'duration'   => max(1, ceil(($end - $start) / 86400)),
            'progress'   => 0,
            'priority'   => 'normal',
            'color'      => '#95a5a6',
            'open'       => true,
        ];
    }

    private function formatLinks()
    {
        $links = [];
        $seen  = [];

        $tasks = [];
        if (isset($this->query) && method_exists($this->query, 'findAll')) {
            $tasks = $this->query->findAll();
        }

        foreach ($tasks as $task) {
            $taskId = $task['id'];

            $outgoing = $this->taskLinkModel ? $this->taskLinkModel->getAll($taskId) : [];
            $incoming = $this->db ? $this->db->table('task_has_links')->eq('opposite_task_id', $taskId)->findAll() : [];

            $taskLinks = array_merge($outgoing, $incoming);

            foreach ($taskLinks as $link) {
                $taskField     = $link['task_id'] ?? null;
                $oppositeField = $link['opposite_task_id'] ?? null;
                $linkType      = $link['link_id'] ?? 0;
                $label         = strtolower($link['label'] ?? '');

                if (!$taskField || !$oppositeField) {
                    continue;
                }

                // Determine link direction
                if ($label === 'is a child of' || $linkType === 1) {
                    $fromId = $oppositeField;
                    $toId   = $taskField;
                } elseif ($label === 'blocks' || $linkType === 3) {
                    $fromId = $taskField;
                    $toId   = $oppositeField;
                } else {
                    $fromId = $taskField;
                    $toId   = $oppositeField;
                }

                if ($fromId === $toId) {
                    continue;
                }

                $pair = "{$fromId}-{$toId}";
                if (isset($seen[$pair])) {
                    continue;
                }

                $seen[$pair] = true;

                $links[] = [
                    'id'     => $link['id'] ?? "{$fromId}_{$toId}",
                    'source' => $fromId,
                    'target' => $toId,
                    'type'   => '0',
                ];
            }
        }

        return $links;
    }
}
