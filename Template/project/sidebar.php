<?php if (isset($project) && !empty($project['id'])): ?>
<li <?= $this->app->checkMenuSelection('DhtmlGantt:ProjectGanttController') ?>>
    <i class="fa fa-bar-chart fa-fw"></i>
    <a href="/gantt/show/<?= $project['id'] ?>" class="gantt-chart-link"><?= t('Gantt chart') ?></a>
</li>
<?php endif ?>
