<?php
// Load milestone status from task metadata if editing existing task
$isMilestone = false;
if (!empty($task['id'])) {
    $metadata = $this->task->taskMetadataModel->getAll($task['id']);
    $isMilestone = !empty($metadata['is_milestone']) && $metadata['is_milestone'] === '1';
} elseif (!empty($values['is_milestone'])) {
    $isMilestone = true;
}
?>
<div class="form-column">
    <div class="form-checkbox">
        <input type="checkbox" 
               name="is_milestone" 
               id="form-is_milestone" 
               value="1"
               <?= $isMilestone ? 'checked' : '' ?>>
        <label for="form-is_milestone">
            <i class="fa fa-flag"></i> <?= t('Set as Milestone') ?>
        </label>
        <p class="form-help"><?= t('Milestones are displayed as diamond markers on the Gantt chart') ?></p>
    </div>
</div>

