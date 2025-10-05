<?php if (isset($project) && !empty($project['id'])): ?>
<li <?= $this->app->checkMenuSelection('DhtmlGantt:ProjectGanttController', 'show') ?>>
    <i class="fa fa-bar-chart fa-fw"></i>
    <a href="/gantt/show/<?= $project['id'] ?>"><?= t('Gantt') ?></a>
</li>
<?php endif ?>
