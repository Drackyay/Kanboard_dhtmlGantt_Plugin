<div class="page-header">
    <h2><?= t('Gantt chart for "%s"', $project['name']) ?></h2>
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

<div class="dhtmlx-gantt-toolbar">
    <button id="gantt-add-task" class="btn btn-blue">
        <i class="fa fa-plus"></i> <?= t('Add Task') ?>
    </button>
    
    <button id="gantt-zoom-in" class="btn">
        <i class="fa fa-search-plus"></i> <?= t('Zoom In') ?>
    </button>
    
    <button id="gantt-zoom-out" class="btn">
        <i class="fa fa-search-minus"></i> <?= t('Zoom Out') ?>
    </button>
    
    <button id="gantt-fit" class="btn">
        <i class="fa fa-arrows-alt"></i> <?= t('Fit to Screen') ?>
    </button>
    
    <select id="gantt-view-mode" class="form-control" style="width: auto; display: inline-block;">
        <option value="day"><?= t('Daily View') ?></option>
        <option value="week"><?= t('Weekly View') ?></option>
        <option value="month"><?= t('Monthly View') ?></option>
        <option value="quarter"><?= t('Quarterly View') ?></option>
        <option value="year"><?= t('Yearly View') ?></option>
    </select>
    
    <div class="gantt-toolbar-right">
        <button id="gantt-export-pdf" class="btn btn-green">
            <i class="fa fa-file-pdf-o"></i> <?= t('Export PDF') ?>
        </button>
        
        <button id="gantt-export-excel" class="btn btn-green">
            <i class="fa fa-file-excel-o"></i> <?= t('Export Excel') ?>
        </button>
        
        <button id="gantt-critical-path" class="btn">
            <i class="fa fa-exclamation-triangle"></i> <?= t('Critical Path') ?>
        </button>
    </div>
</div>

<!-- DHTMLX Gantt Library - CDN Version -->
<link rel="stylesheet" href="https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css">
<script src="https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js"></script>

<div id="dhtmlx-gantt-container" style="width: 100%; height: 600px; border: 1px solid #ccc;"></div>

<script type="text/javascript">
document.addEventListener('DOMContentLoaded', function() {
    // Configure DHtmlX Gantt
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.xml_date = "%Y-%m-%d";
    gantt.config.scale_unit = "day";
    gantt.config.date_scale = "%d %M";
    gantt.config.subscales = [
        {unit: "hour", step: 1, date: "%H"}
    ];
    
    // Enable plugins
    gantt.plugins({
        tooltip: true,
        keyboard_navigation: true,
        undo: true,
        critical_path: true,
        export_api: true
    });
    
    // Configure columns - simplified for DHTMLX Gantt format
    gantt.config.columns = [
        {name: "text", label: "Task Name", tree: true, width: 250, resize: true},
        {name: "start_date", label: "Start Date", align: "center", width: 100, resize: true},
        {name: "duration", label: "Duration", align: "center", width: 70, resize: true},
        {name: "progress", label: "Progress", align: "center", width: 80, resize: true},
        {name: "add", label: "", width: 44}
    ];
    
    // Custom task styling based on progress
    gantt.templates.task_class = function(start, end, task) {
        if (task.progress >= 0.8) return 'gantt-high-progress';
        if (task.progress <= 0.2) return 'gantt-low-progress';
        return '';
    };
    
    // Progress template
    gantt.templates.progress_text = function(start, end, task) {
        return "<span style='text-align:left;'>" + Math.round(task.progress * 100) + "% </span>";
    };
    
    // Initialize Gantt
    gantt.init("dhtmlx-gantt-container");
    
    // Load data from new clean JSON endpoint
    gantt.load("/gantt/json/<?= $project['id'] ?>");
    
    // Data processor for CRUD operations
    var dp = new gantt.dataProcessor("<?= $this->url->href('DhtmlGantt:ProjectGanttController', 'update', array('project_id' => $project['id'])) ?>");
    dp.init(gantt);
    dp.setTransactionMode("REST");
    
    // Toolbar event handlers
    document.getElementById('gantt-add-task').addEventListener('click', function() {
        gantt.createTask();
    });
    
    document.getElementById('gantt-zoom-in').addEventListener('click', function() {
        gantt.ext.zoom.zoomIn();
    });
    
    document.getElementById('gantt-zoom-out').addEventListener('click', function() {
        gantt.ext.zoom.zoomOut();
    });
    
    document.getElementById('gantt-fit').addEventListener('click', function() {
        gantt.ext.zoom.setLevel("month");
    });
    
    document.getElementById('gantt-view-mode').addEventListener('change', function() {
        var mode = this.value;
        switch(mode) {
            case 'day':
                gantt.config.scale_unit = "day";
                gantt.config.date_scale = "%d %M";
                gantt.config.subscales = [{unit: "hour", step: 1, date: "%H"}];
                break;
            case 'week':
                gantt.config.scale_unit = "week";
                gantt.config.date_scale = "Week #%W";
                gantt.config.subscales = [{unit: "day", step: 1, date: "%d %M"}];
                break;
            case 'month':
                gantt.config.scale_unit = "month";
                gantt.config.date_scale = "%F %Y";
                gantt.config.subscales = [{unit: "day", step: 1, date: "%d"}];
                break;
            case 'quarter':
                gantt.config.scale_unit = "quarter";
                gantt.config.date_scale = "Q%q %Y";
                gantt.config.subscales = [{unit: "month", step: 1, date: "%M"}];
                break;
            case 'year':
                gantt.config.scale_unit = "year";
                gantt.config.date_scale = "%Y";
                gantt.config.subscales = [{unit: "month", step: 1, date: "%M"}];
                break;
        }
        gantt.render();
    });
    
    document.getElementById('gantt-export-pdf').addEventListener('click', function() {
        gantt.exportToPDF({
            name: "<?= $project['name'] ?>_gantt.pdf",
            header: "<h1><?= $project['name'] ?> - Gantt Chart</h1>",
            footer: "<div style='text-align: center;'>Generated: " + new Date().toLocaleDateString() + "</div>"
        });
    });
    
    document.getElementById('gantt-export-excel').addEventListener('click', function() {
        gantt.exportToExcel({
            name: "<?= $project['name'] ?>_gantt.xlsx"
        });
    });
    
    document.getElementById('gantt-critical-path').addEventListener('click', function() {
        if (gantt.config.highlight_critical_path) {
            gantt.config.highlight_critical_path = false;
            this.classList.remove('btn-red');
            this.innerHTML = '<i class="fa fa-exclamation-triangle"></i> <?= t("Critical Path") ?>';
        } else {
            gantt.config.highlight_critical_path = true;
            this.classList.add('btn-red');
            this.innerHTML = '<i class="fa fa-exclamation-triangle"></i> <?= t("Critical Path ON") ?>';
        }
        gantt.render();
    });
});
</script>

<style>
.dhtmlx-gantt-toolbar {
    padding: 10px;
    background: #f4f4f4;
    border: 1px solid #ccc;
    border-bottom: none;
    display: flex;
    align-items: center;
    gap: 10px;
}

.gantt-toolbar-right {
    margin-left: auto;
    display: flex;
    gap: 10px;
}

.gantt-high-progress .gantt_task_line {
    background: #27ae60 !important;
    border-color: #229954 !important;
}

.gantt-low-progress .gantt_task_line {
    background: #e74c3c !important;
    border-color: #c0392b !important;
}

#dhtmlx-gantt-container {
    font-family: Arial, sans-serif;
}

.btn-red {
    background-color: #e74c3c !important;
    color: white !important;
}
</style>
