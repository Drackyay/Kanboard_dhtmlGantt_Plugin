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

    public function format()
    {
        $tasks = [];

        foreach ($this->query->findAll() as $task) {
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

    // Fetch all tasks in the current query
    $tasks = $this->query->findAll();

    foreach ($tasks as $task) {
        $taskId = $task['id'];

        // 1️ Get direct (outgoing) links
        $outgoing = $this->taskLinkModel->getAll($taskId);

        // 2️ Get incoming links (where this task is the opposite)
        $incoming = $this->db->table('task_has_links')
            ->eq('opposite_task_id', $taskId)
            ->findAll();

        $taskLinks = array_merge($outgoing, $incoming);

        foreach ($taskLinks as $link) {
            $fromId = null;
            $toId   = null;

            $taskField     = isset($link['task_id']) ? (int) $link['task_id'] : null;
            $oppositeField = isset($link['opposite_task_id']) ? (int) $link['opposite_task_id'] : null;
            $linkType      = isset($link['link_id']) ? (int) $link['link_id'] : 0;
            $label         = isset($link['label']) ? strtolower($link['label']) : '';

            if (!$taskField || !$oppositeField) {
                continue;
            }

            // Interpret direction correctly
            if ($label === 'is a child of' || $linkType === 1) {
                // Parent → child
                $fromId = $oppositeField;
                $toId   = $taskField;
            } elseif ($label === 'blocks' || $linkType === 3) {
                // Blocking task → blocked task
                $fromId = $taskField;
                $toId   = $oppositeField;
            } else {
                // Default direction
                $fromId = $taskField;
                $toId   = $oppositeField;
            }

            if ($fromId === $toId) {
                continue;
            }

            $pair = $fromId . '-' . $toId;
            if (isset($seen[$pair])) {
                continue;
            }
            $seen[$pair] = true;

            $links[] = [
                'id'     => isset($link['id']) ? (int) $link['id'] : ($fromId . '_' . $toId),
                'source' => $fromId,
                'target' => $toId,
                'type'   => '0',
            ];
        }
    }

    error_log('DhtmlGantt Links emitted: ' . json_encode($links));
    return $links;
}

    
    
}
