<section id="main" style="display: flex; flex-direction: column; height: 100%;">
    <?= $this->projectHeader->render($project, 'TaskGanttController', 'show', false, 'DhtmlGantt') ?>

    <?php
        // read current sorting and group selection passed from controller
        $sorting = isset($sorting) ? $sorting : $this->request->getStringParam('sorting', 'board');
        $cur     = isset($groupBy) && $groupBy !== '' ? $groupBy : 'none';
    ?>
    
    <div class="menu-inline" style="flex-shrink: 0;">
        <ul>
            <!-- Sort by position -->
            <li <?= $sorting === 'board' ? 'class="active"' : '' ?>>
                <?= $this->url->icon(
                    'sort-numeric-asc',
                    t('Sort by position'),
                    'TaskGanttController',
                    'show',
                    array(
                        'project_id' => $project['id'],
                        'sorting'    => 'board',
                        'plugin'     => 'DhtmlGantt',
                        'group_by'   => $cur
                    )
                ) ?>
            </li>

            <!-- Sort by date -->
            <li <?= $sorting === 'date' ? 'class="active"' : '' ?>>
                <?= $this->url->icon(
                    'sort-amount-asc',
                    t('Sort by date'),
                    'TaskGanttController',
                    'show',
                    array(
                        'project_id' => $project['id'],
                        'sorting'    => 'date',
                        'plugin'     => 'DhtmlGantt',
                        'group_by'   => $cur
                    )
                ) ?>
            </li>

            <li>
                <?= $this->modal->large('plus', t('Add task'), 'TaskCreationController', 'show', array('project_id' => $project['id'])) ?>
            </li>

            <!-- View buttons (handled by external JS) -->
            <li><button type="button" class="btn btn-dhtmlx-view" data-view="Quarter Day">Quarter Day</button></li>
            <li><button type="button" class="btn btn-dhtmlx-view" data-view="Half Day">Half Day</button></li>
            <li><button type="button" class="btn btn-dhtmlx-view" data-view="Day">Day</button></li>
            <li><button type="button" class="btn btn-dhtmlx-view active" data-view="Week">Week</button></li>
            <li><button type="button" class="btn btn-dhtmlx-view" data-view="Month">Month</button></li>
        </ul>
    </div>

    <div class="dhtmlx-gantt-container" style="flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden;">
        <!-- DHtmlX Gantt Toolbar -->
        <div class="dhtmlx-gantt-toolbar" style="flex-shrink: 0;">
            <button id="dhtmlx-add-task" class="btn btn-blue" title="<?= t('Add Task') ?>">
                <i class="fa fa-plus"></i> <?= t('Add Task') ?>
            </button>

            <!-- Group by Dropdown -->
            <label style="margin-left: 15px; display: flex; align-items: center; gap: 5px;">
                <i class="fa fa-users"></i>
                <span><?= t('Group by') ?>:</span>
                <select id="dhtmlx-group-by-select" class="btn" style="padding: 5px 10px; cursor: pointer;">
                    <option value="none"><?= t('None') ?></option>
                    <option value="assignee"><?= t('Assignee') ?></option>
                    <option value="group"><?= t('User Group') ?></option>
                    <option value="sprint"><?= t('Sprint') ?></option>
                </select>
            </label>

            <!-- Toggle: Move Dependencies -->
            <label class="dhtmlx-toggle" style="margin-left: 15px;">
                <input type="checkbox" id="move-dependencies-toggle">
                <?= t('Move dependencies with task') ?>
            </label>

            <!-- Toggle: Show Progress Bars -->
            <label class="dhtmlx-toggle" style="margin-left: 15px;">
                <input type="checkbox" id="show-progress-toggle" checked>
                <?= t('Show progress bars') ?>
            </label>

            <div class="dhtmlx-toolbar-separator"></div>

            <button id="dhtmlx-zoom-in" class="btn" title="<?= t('Zoom In') ?>">
                <i class="fa fa-search-plus"></i>
            </button>

            <button id="dhtmlx-zoom-out" class="btn" title="<?= t('Zoom Out') ?>">
                <i class="fa fa-search-minus"></i>
            </button>

            <button id="dhtmlx-expand-toggle" class="btn" title="<?= t('Expand All') ?>" data-state="collapsed">
                <i class="fa fa-expand"></i>
            </button>
        </div>

        <!-- Gantt Chart -->
        <div id="dhtmlx-gantt-chart"
             data-project-id="<?= $project['id'] ?>"
             data-group-by="<?= $cur ?>" 
             style="flex: 1; width: 100%; min-height: 0; position: relative;"
             data-tasks='<?= htmlspecialchars(json_encode($tasks), ENT_QUOTES, 'UTF-8') ?>'
             data-update-url="<?= $this->url->href('TaskGanttController', 'save', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>"
             data-create-url="<?= $this->url->href('TaskGanttController', 'create', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>"
             data-remove-url="<?= $this->url->href('TaskGanttController', 'remove', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>"
             data-create-link-url="<?= $this->url->href('TaskGanttController', 'dependency', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>"
             data-remove-link-url="<?= $this->url->href('TaskGanttController', 'removeDependency', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>">
        </div>

        <!-- Task Information Panel -->
        <div class="dhtmlx-gantt-info" style="flex-shrink: 0;">
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
                        <span class="dhtmlx-legend-color" style="background: #27ae60;"></span>
                        <span><?= t('Milestone') ?></span>
                    </div>
                    <div class="dhtmlx-legend-item">
                        <span class="dhtmlx-legend-color" style="background: #9b59b6;"></span>
                        <span><?= t('Sprint') ?></span>
                    </div>
                </div>
            </div>
        </div>
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
.dhtmlx-stats { display: flex; gap: 20px; }
.dhtmlx-stat-item { display: flex; flex-direction: column; align-items: center; }
.dhtmlx-stat-label { font-size: 12px; color: #666; }
.dhtmlx-stat-value { font-size: 18px; font-weight: bold; color: #333; }
.dhtmlx-legend { display: flex; flex-direction: column; gap: 5px; }
.dhtmlx-legend-item { display: flex; align-items: center; gap: 8px; }
.dhtmlx-legend-color { width: 16px; height: 16px; border-radius: 3px; }
.gantt_task_line.dhtmlx-priority-high   { background: #e74c3c !important; border-color: #c0392b !important; }
.gantt_task_line.dhtmlx-priority-medium { background: #f39c12 !important; border-color: #e67e22 !important; }
.gantt_task_line.dhtmlx-priority-low    { background: #3498db !important; border-color: #2980b9 !important; }
.gantt_task_line.dhtmlx-priority-normal { background: #95a5a6 !important; border-color: #7f8c8d !important; }
.gantt_task_line.dhtmlx-readonly { opacity: 0.6; }
.btn-dhtmlx-view.active { background-color: #667eea !important; color: white !important; }
.dhtmlx-toggle { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #333; cursor: pointer; }
.dhtmlx-toggle input[type="checkbox"] { transform: scale(1.1); margin-right: 5px; }
</style>
