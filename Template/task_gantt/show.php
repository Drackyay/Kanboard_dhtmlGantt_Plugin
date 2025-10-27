<section id="main">
    <?= $this->projectHeader->render($project, 'TaskGanttController', 'show', false, 'DhtmlGantt') ?>
    
    <div class="menu-inline">
        <ul>
            <li <?= $sorting === 'board' ? 'class="active"' : '' ?>>
                <?= $this->url->icon('sort-numeric-asc', t('Sort by position'), 'TaskGanttController', 'show', array('project_id' => $project['id'], 'sorting' => 'board', 'plugin' => 'DhtmlGantt')) ?>
            </li>
            <li <?= $sorting === 'date' ? 'class="active"' : '' ?>>
                <?= $this->url->icon('sort-amount-asc', t('Sort by date'), 'TaskGanttController', 'show', array('project_id' => $project['id'], 'sorting' => 'date', 'plugin' => 'DhtmlGantt')) ?>
            </li>



            <li>
                <?= $this->modal->large('plus', t('Add task'), 'TaskCreationController', 'show', array('project_id' => $project['id'])) ?>
            </li>
            <li>
                <button type="button" class="btn btn-dhtmlx-view" data-view="Quarter Day">Quarter Day</button>
            </li>
            <li>
                <button type="button" class="btn btn-dhtmlx-view" data-view="Half Day">Half Day</button>
            </li>
            <li>
                <button type="button" class="btn btn-dhtmlx-view" data-view="Day">Day</button>
            </li>
            <li>
                <button type="button" class="btn btn-dhtmlx-view active" data-view="Week">Week</button>
            </li>
            <li>
                <button type="button" class="btn btn-dhtmlx-view" data-view="Month">Month</button>
            </li>
        </ul>
    </div>

    <div class="dhtmlx-gantt-container">
            <!-- DHtmlX Gantt Toolbar -->
            <div class="dhtmlx-gantt-toolbar">
                <button id="dhtmlx-add-task" class="btn btn-blue" title="<?= t('Add Task') ?>">
                    <i class="fa fa-plus"></i> <?= t('Add Task') ?>
                </button>


                <!-- NEW: Group by Assignee -->
                <button id="dhtmlx-group-assignee" class="btn" title="<?= t('Group by Assignee') ?>">
    <i class="fa fa-users"></i> <?= t('Group by Assignee') ?>
</button>
                
                <button id="dhtmlx-zoom-in" class="btn" title="<?= t('Zoom In') ?>">
                    <i class="fa fa-search-plus"></i>
                </button>
                
                <button id="dhtmlx-zoom-out" class="btn" title="<?= t('Zoom Out') ?>">
                    <i class="fa fa-search-minus"></i>
                </button>
                
                <button id="dhtmlx-fit" class="btn" title="<?= t('Fit to Screen') ?>">
                    <i class="fa fa-arrows-alt"></i>
                </button>
                
                <div class="dhtmlx-toolbar-separator"></div>
                
                <button id="dhtmlx-expand-all" class="btn" title="<?= t('Expand All') ?>">
                    <i class="fa fa-expand"></i>
                </button>
                
            </div>

            <!-- DHtmlX Gantt Chart Container -->
            <!-- <div id="dhtmlx-gantt-chart" style="width: 100%; height: 600px;"></div> -->

            <div id="dhtmlx-gantt-chart" 
     style="width: 100%; height: 600px;"
     data-tasks='<?= htmlspecialchars(json_encode($tasks), ENT_QUOTES, 'UTF-8') ?>'
     data-project-id="<?= $project['id'] ?>"
     data-update-url="<?= $this->url->to('TaskGanttController', 'save', array('project_id' => $project['id']), false, '', 'DhtmlGantt') ?>"
     data-create-url="<?= $this->url->to('TaskGanttController', 'create', array('project_id' => $project['id']), false, '', 'DhtmlGantt') ?>"
     data-remove-url="<?= $this->url->to('TaskGanttController', 'remove', array('project_id' => $project['id']), false, '', 'DhtmlGantt') ?>"
     data-create-link-url="<?= $this->url->to('TaskGanttController', 'dependency', array('project_id' => $project['id']), false, '', 'DhtmlGantt') ?>"
     data-remove-link-url="<?= $this->url->to('TaskGanttController', 'removeDependency', array('project_id' => $project['id']), false, '', 'DhtmlGantt') ?>">
</div>
            
            <!-- Task Information Panel -->
            <div class="dhtmlx-gantt-info">
                <div class="dhtmlx-info-section">
                    <h3><?= t('Project Statistics') ?></h3>
                    <div class="dhtmlx-stats">
                        <div class="dhtmlx-stat-item">
                            <span class="dhtmlx-stat-label"><?= t('Total Tasks') ?>:</span>
                            <span class="dhtmlx-stat-value"><?= count($tasks['data'] ?? $tasks) ?></span>
                        </div>
                        <div class="dhtmlx-stat-item">
                            <span class="dhtmlx-stat-label"><?= t('Completed') ?>:</span>
                            <span class="dhtmlx-stat-value" id="dhtmlx-completed-count">0</span>
                        </div>
                        <div class="dhtmlx-stat-item">
                            <span class="dhtmlx-stat-label"><?= t('In Progress') ?>:</span>
                            <span class="dhtmlx-stat-value" id="dhtmlx-progress-count">0</span>
                        </div>
                    </div>
                </div>
                



                <!-- <div class="dhtmlx-info-section">
                    <h3><?= t('Legend') ?></h3>
                    <div class="dhtmlx-legend">
                        <div class="dhtmlx-legend-item">
                            <span class="dhtmlx-legend-color" style="background: #3498db;"></span>
                            <span><?= t('Normal Priority') ?></span>
                        </div>
                        <div class="dhtmlx-legend-item">
                            <span class="dhtmlx-legend-color" style="background: #f39c12;"></span>
                            <span><?= t('Medium Priority') ?></span>
                        </div>
                        <div class="dhtmlx-legend-item">
                            <span class="dhtmlx-legend-color" style="background: #e74c3c;"></span>
                            <span><?= t('High Priority') ?></span>
                        </div>
                    </div>
                </div> -->


                <div class="dhtmlx-info-section">
                    <h3><?= t('Legend') ?></h3>
                    <div class="dhtmlx-legend">
                        <div class="dhtmlx-legend-item">
                            <span class="dhtmlx-legend-color" style="background: #95a5a6;"></span>
                            <span><?= t('Normal Priority') ?></span>
                        </div>
                        <div class="dhtmlx-legend-item">
                            <span class="dhtmlx-legend-color" style="background: #3498db;"></span>
                            <span><?= t('Low Priority') ?></span>
                        </div>
                        <div class="dhtmlx-legend-item">
                            <span class="dhtmlx-legend-color" style="background: #f39c12;"></span>
                            <span><?= t('Medium Priority') ?></span>
                        </div>
                        <div class="dhtmlx-legend-item">
                            <span class="dhtmlx-legend-color" style="background: #e74c3c;"></span>
                            <span><?= t('High Priority') ?></span>
                        </div>
                        <div class="dhtmlx-legend-item">
                            <span class="dhtmlx-legend-milestone"></span>
                            <span><?= t('Milestone') ?></span>
                        </div>
                    </div>
                </div>





            </div>
        </div>

        <script type="text/javascript">
        // Debug: Check what tasks we have
        console.log('Raw tasks from PHP:', <?= json_encode($tasks) ?>);
        
        // Set data for external script (CSP-compliant)
        window.taskData = <?= json_encode($tasks) ?> || {data: [], links: []};
        window.ganttUrls = {
            update: "<?= $this->url->href('TaskGanttController', 'save', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>",
            create: "<?= $this->url->href('TaskGanttController', 'create', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>",
            remove: "<?= $this->url->href('TaskGanttController', 'remove', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>",
            createLink: "<?= $this->url->href('TaskGanttController', 'dependency', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>",
            removeLink: "<?= $this->url->href('TaskGanttController', 'removeDependency', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>"
        };
        
        // Debug: Log the URLs being generated
        console.log('Generated URLs:', window.ganttUrls);
        
        // Add some sample data if no tasks exist for testing
        if (!window.taskData || (!window.taskData.data && !Array.isArray(window.taskData)) || 
            (window.taskData.data && window.taskData.data.length === 0) ||
            (Array.isArray(window.taskData) && window.taskData.length === 0)) {
            
            console.log('No tasks found, adding sample data for testing');
            window.taskData = {
                data: [
                    {
                        id: 1,
                        text: "Sample Task",
                        start_date: "<?= date('Y-m-d H:i') ?>",
                        duration: 3,
                        progress: 0.5,
                        priority: "normal"
                    }
                ],
                links: []
            };
        }
        </script>

    </div>

</section>

<style>
.dhtmlx-gantt-container {
    border: 1px solid #ddd;
    background: #fff;
}

.dhtmlx-gantt-toolbar {
    background: #f8f9fa;
    border-bottom: 1px solid #ddd;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.dhtmlx-toolbar-separator {
    width: 1px;
    height: 20px;
    background: #ddd;
    margin: 0 5px;
}

.dhtmlx-gantt-info {
    background: #f8f9fa;
    border-top: 1px solid #ddd;
    padding: 15px;
    display: flex;
    gap: 30px;
}

.dhtmlx-info-section h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: bold;
}

.dhtmlx-stats {
    display: flex;
    gap: 20px;
}

.dhtmlx-stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.dhtmlx-stat-label {
    font-size: 12px;
    color: #666;
}

.dhtmlx-stat-value {
    font-size: 18px;
    font-weight: bold;
    color: #333;
}

.dhtmlx-legend {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.dhtmlx-legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.dhtmlx-legend-color {
    width: 16px;
    height: 16px;
    border-radius: 3px;
}

/* DHtmlX Gantt custom styles
.dhtmlx-priority-high .gantt_task_line {
    background: #e74c3c !important;
    border-color: #c0392b !important;
}

.dhtmlx-priority-medium .gantt_task_line {
    background: #f39c12 !important;
    border-color: #e67e22 !important;
}

.dhtmlx-priority-low .gantt_task_line {
    background: #3498db !important;
    border-color: #2980b9 !important;
}

.dhtmlx-readonly .gantt_task_line {
    opacity: 0.6;
}

.btn-dhtmlx-view.active {
    background-color: #667eea !important;
    color: white !important;
} */

 /* DHtmlX Gantt custom styles */
.gantt_task_line.dhtmlx-priority-high {
    background: #e74c3c !important;      /* Red */
    border-color: #c0392b !important;
}

.gantt_task_line.dhtmlx-priority-medium {
    background: #f39c12 !important;      /* Orange */
    border-color: #e67e22 !important;
}

.gantt_task_line.dhtmlx-priority-low {
    background: #3498db !important;      /* Blue */
    border-color: #2980b9 !important;
}

.gantt_task_line.dhtmlx-priority-normal {
    background: #95a5a6 !important;      /* Gray */
    border-color: #7f8c8d !important;
}

.gantt_task_line.dhtmlx-readonly {
    opacity: 0.6;
}

.btn-dhtmlx-view.active {
    background-color: #667eea !important;
    color: white !important;
}
</style>
