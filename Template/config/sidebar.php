<li <?= $this->app->checkMenuSelection('ConfigController') ?>>
    <?= $this->url->link(t('DHtmlX Gantt'), 'ConfigController', 'show', array('plugin' => 'DhtmlGantt')) ?>
</li>
