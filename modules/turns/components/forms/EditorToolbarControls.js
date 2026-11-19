import { memo } from 'react';
import { TID } from '@/config/testIds';
import { MD_COLORS } from '../widgets/md/markdown';

// Общая разметка нативного тулбара Quill: абзац / Markdown и Visual перевода.
// Snow добавляет те же SVG, палитру и список заголовков при создании редактора.
const EditorToolbarControls = memo(({ testId = TID.addTurn.toolbar }) => (
  <>
    <span className="ql-formats">
      <select className="ql-background" data-test-id={testId('background')}>
        <option value="" />
        {Object.values(MD_COLORS).map(({ rgb }) => <option value={rgb} key={rgb} />)}
      </select>
      <button type="button" className="ql-bold" data-test-id={testId('bold')} />
      <button type="button" className="ql-italic" data-test-id={testId('italic')} />
      <button type="button" className="ql-link" data-test-id={testId('link')} />
    </span>
    <span className="ql-formats md-only">
      <select className="ql-header" defaultValue="" data-test-id={testId('header')}>
        <option value="1" />
        <option value="2" />
        <option value="3" />
        <option value="" />
      </select>
      <button type="button" className="ql-list" value="bullet" data-test-id={testId('list-bullet')} />
      <button type="button" className="ql-list" value="ordered" data-test-id={testId('list-ordered')} />
      <button type="button" className="ql-blockquote" data-test-id={testId('blockquote')} />
      <button type="button" className="ql-code-block" data-test-id={testId('code-block')} />
      <button type="button" className="ql-strike" data-test-id={testId('strike')} />
    </span>
  </>
));

export default EditorToolbarControls;
