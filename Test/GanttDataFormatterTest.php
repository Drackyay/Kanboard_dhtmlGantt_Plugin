<?php

namespace Kanboard\Plugin\DhtmlGantt\Test;

/**
 * Test for GanttDataFormatter
 * Verifies that the output matches DHTMLX Gantt expected format
 */
class GanttDataFormatterTest
{
    /**
     * Sample test data that mimics Kanboard task structure
     */
    public static function getSampleKanboardTasks()
    {
        return [
            [
                'id' => 1,
                'title' => 'Task A',
                'date_started' => strtotime('2025-09-28'),
                'date_due' => strtotime('2025-10-03'),
                'time_spent' => 16, // 2 days * 8 hours
                'time_estimated' => 40, // 5 days * 8 hours
                'project_id' => 1,
                'column_id' => 2,
                'priority' => 2,
                'is_active' => 1
            ],
            [
                'id' => 2,
                'title' => 'Task B',
                'date_started' => strtotime('2025-09-30'),
                'date_due' => strtotime('2025-10-03'),
                'time_spent' => 24, // 3 days * 8 hours  
                'time_estimated' => 24, // 3 days * 8 hours
                'project_id' => 1,
                'column_id' => 3,
                'priority' => 1,
                'is_active' => 1
            ]
        ];
    }
    
    /**
     * Sample task links that mimic Kanboard dependency structure
     */
    public static function getSampleKanboardLinks()
    {
        return [
            [
                'id' => 1,
                'source_task_id' => 1,
                'target_task_id' => 2,
                'link_id' => 2, // "blocks" relationship
                'label' => 'blocks'
            ]
        ];
    }
    
    /**
     * Expected DHTMLX Gantt format output
     * This should match your specification exactly
     */
    public static function getExpectedGanttFormat()
    {
        return [
            "data" => [
                [
                    "id" => 1,
                    "text" => "Task A",
                    "start_date" => "2025-09-28",
                    "duration" => 5,
                    "progress" => 0.4,
                    "parent" => 0
                ],
                [
                    "id" => 2,
                    "text" => "Task B",
                    "start_date" => "2025-09-30",
                    "duration" => 3,
                    "progress" => 1.0,
                    "parent" => 0
                ]
            ],
            "links" => [
                [
                    "id" => 1,
                    "source" => 1,
                    "target" => 2,
                    "type" => "0"
                ]
            ]
        ];
    }
    
    /**
     * Manual test to verify format
     * Run this to check if the formatter output matches expectations
     */
    public static function testFormatOutput()
    {
        echo "=== DHTMLX Gantt Format Test ===\n\n";
        
        $tasks = self::getSampleKanboardTasks();
        $links = self::getSampleKanboardLinks();
        $expected = self::getExpectedGanttFormat();
        
        echo "Sample Kanboard Tasks:\n";
        echo json_encode($tasks, JSON_PRETTY_PRINT) . "\n\n";
        
        echo "Sample Kanboard Links:\n";
        echo json_encode($links, JSON_PRETTY_PRINT) . "\n\n";
        
        echo "Expected DHTMLX Format:\n";
        echo json_encode($expected, JSON_PRETTY_PRINT) . "\n\n";
        
        echo "=== Test Complete ===\n";
        echo "To run actual formatter test, integrate with Kanboard test framework\n";
    }
}

// If running directly, execute test
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    GanttDataFormatterTest::testFormatOutput();
} 