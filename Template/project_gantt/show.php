<div class="page-header">
    <h2><?= t('DHtmlX Gantt chart for "%s"', $project['name']) ?></h2>
    <ul>
        <li>
            <?= $this->modal->large('plus', t('Add task'), 'TaskCreationController', 'show', array('project_id' => $project['id'])) ?>
        </li>
        <li>
            <i class="fa fa-cog fa-fw"></i>
            <?= $this->url->link(t('Project settings'), 'ProjectViewController', 'show', array('project_id' => $project['id'])) ?>
        </li>
    </ul>
</div>

<div class="gantt-project-overview">
    <div class="gantt-project-info">
        <h3><?= t('Project Overview') ?></h3>
        <div class="gantt-project-stats">
            <div class="gantt-stat-card">
                <div class="gantt-stat-number" id="total-tasks">0</div>
                <div class="gantt-stat-label"><?= t('Total Tasks') ?></div>
            </div>
            <div class="gantt-stat-card">
                <div class="gantt-stat-number" id="completed-tasks">0</div>
                <div class="gantt-stat-label"><?= t('Completed') ?></div>
            </div>
            <div class="gantt-stat-card">
                <div class="gantt-stat-number" id="progress-tasks">0</div>
                <div class="gantt-stat-label"><?= t('In Progress') ?></div>
            </div>
            <div class="gantt-stat-card">
                <div class="gantt-stat-number" id="overdue-tasks">0</div>
                <div class="gantt-stat-label"><?= t('Overdue') ?></div>
            </div>
        </div>
    </div>
    
    <div class="gantt-project-actions">
        <button id="load-gantt-view" class="btn btn-blue">
            <i class="fa fa-sliders"></i> <?= t('View Gantt Chart') ?>
        </button>
    </div>
</div>

<div id="dhtmlx-gantt-container" style="display: none;">
    <!-- This will load the full Gantt chart -->
</div>

<script type="text/javascript">
document.addEventListener('DOMContentLoaded', function() {
    // Load project statistics
    loadProjectStatistics();
    
    // Handle Gantt view button
    document.getElementById('load-gantt-view').addEventListener('click', function() {
        window.location.href = '<?= $this->url->href('TaskGanttController', 'show', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>';
    });
});

function loadProjectStatistics() {
    // This would typically load via AJAX
    // For now, we'll redirect to the full Gantt view
    fetch('<?= $this->url->href('TaskGanttController', 'show', array('project_id' => $project['id'], 'plugin' => 'DhtmlGantt')) ?>')
        .then(function() {
            // Update stats based on project data
            // This is a simplified version
            document.getElementById('total-tasks').textContent = '<?= count($project['tasks'] ?? []) ?>';
        })
        .catch(function(error) {
            console.log('Could not load project statistics:', error);
        });
}
</script>

<style>
.gantt-project-overview {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 20px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.gantt-project-info h3 {
    margin: 0 0 15px 0;
    color: #333;
}

.gantt-project-stats {
    display: flex;
    gap: 20px;
}

.gantt-stat-card {
    text-align: center;
    min-width: 80px;
}

.gantt-stat-number {
    font-size: 24px;
    font-weight: bold;
    color: #667eea;
}

.gantt-stat-label {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
}

.gantt-project-actions {
    display: flex;
    align-items: center;
}

#load-gantt-view {
    font-size: 16px;
    padding: 12px 24px;
}
</style>