import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Save, X } from 'lucide-react';
import { projectTitle, editorErrorMessage } from './localization.js';

async function prepareImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('image-type');
  if (file.size > 20 * 1024 * 1024) throw new Error('image-size');
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const scale = Math.min(1, 1800 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/webp', .9);
  } finally { URL.revokeObjectURL(source); }
}

export default function ProjectEditor({ projects, initialId, t, onSave, onClose }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const requestRef = useRef(null);
  const uploadVersion = useRef(0);
  const [id, setId] = useState(initialId || projects[0].id);
  const project = projects.find(item => item.id === id);
  const [link, setLink] = useState(project.link || '');
  const [preview, setPreview] = useState(project.thumbnail || project.image || '');
  const [imageData, setImageData] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState(false);
  const [notice, setNotice] = useState('');
  const [dirty, setDirty] = useState(false);
  const hasChanges = dirty || reading;

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialogRef.current.showModal(); document.body.style.overflow = 'hidden';
    return () => { uploadVersion.current++; requestRef.current?.abort(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);

  function discardChanges() {
    return !hasChanges || window.confirm(t('有尚未保存的修改，要放弃这些修改吗？', 'Discard your unsaved changes?'));
  }
  function close() { if (!busy && discardChanges()) onClose(); }
  function selectProject(nextId) {
    if (busy || !discardChanges()) return;
    uploadVersion.current++;
    const next = projects.find(item => item.id === nextId);
    setId(nextId); setLink(next.link || ''); setPreview(next.thumbnail || next.image || ''); setImageData(null); setRemoveImage(false); setNotice(''); setDirty(false); setReading(false);
    if (inputRef.current) inputRef.current.value = '';
  }
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const version = ++uploadVersion.current;
    setReading(true); setNotice('');
    try {
      const data = await prepareImage(file);
      if (version !== uploadVersion.current) return;
      setImageData(data); setPreview(data); setRemoveImage(false); setDirty(true);
    } catch (error) { if (version === uploadVersion.current) setNotice(editorErrorMessage(error.message, ['无法读取这张图片，请重试。', 'Unable to read this image. Please try again.'])); }
    finally { if (version === uploadVersion.current) setReading(false); }
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setNotice('');
    const controller = new AbortController(); requestRef.current = controller;
    try {
      const response = await fetch('/__portfolio/project-media', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Portfolio-Editor': '1' }, signal: controller.signal, body: JSON.stringify({ id, link: link.trim(), imageData, removeImage }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'save-failed');
      onSave(data.media); setImageData(null); setRemoveImage(false); setDirty(false); setPreview(data.media[id].thumbnail || data.media[id].image); setNotice(['已保存到网站文件，刷新后也会保留。', 'Saved to the website files. Changes will remain after refresh.']);
    } catch (error) { if (error.name !== 'AbortError') setNotice(editorErrorMessage(error.message, ['保存失败，请检查本地预览服务后重试。', 'Unable to save. Check the local preview server and try again.'])); }
    finally { setBusy(false); }
  }

  return <dialog ref={dialogRef} className="project-dialog editor-dialog" aria-labelledby="editor-title" onCancel={event => { event.preventDefault(); close(); }}>
    <div className="dialog-top"><span className="mono">{t('本地工作区 / 内容编辑', 'LOCAL WORKSPACE / CONTENT EDITOR')}</span><button className="icon-button" onClick={close} disabled={busy} aria-label={t('关闭编辑', 'Close editor')}><X size={21} /></button></div>
    <form className="editor-body" onSubmit={save}><h2 id="editor-title">{t('补充图片与链接', 'Add images & links')}</h2><p>{t('选一个项目，上传封面或填写作品链接。保存会更新本机网站文件；正式发布的页面不会显示这个编辑入口。', 'Choose a project, add its cover or project URL, and save directly to the local website files. This editor is hidden on the published site.')}</p>
      <label className="editor-field">{t('选择项目', 'Project')}<select value={id} onChange={event => selectProject(event.target.value)} disabled={busy}>{projects.map(item => <option key={item.id} value={item.id}>{projectTitle(item, t)}</option>)}</select></label>
      <div className="editor-media-row"><div className="editor-preview">{preview ? <img src={preview} alt={t('封面预览', 'Cover preview')} /> : <ImagePlus size={38} strokeWidth={1} />}</div><div className="editor-upload"><label className="button editor-file-label"><ImagePlus size={17} />{reading ? t('正在准备图片…', 'Preparing image…') : t('选择封面图片', 'Choose cover image')}<input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy || reading} /></label><p>JPG / PNG / WebP · ≤ 20 MB</p><p>{t('建议使用横向原图。封面会自动压缩，原始图片不会被修改。', 'A landscape image works best. Covers are compressed automatically; your original file is unchanged.')}</p>{preview && <button type="button" className="text-link" disabled={busy || reading} onClick={() => { setPreview(''); setImageData(null); setRemoveImage(true); setDirty(true); }}>{t('恢复空白图位', 'Use an empty image space')}</button>}</div></div>
      <label className="editor-field">{t('作品链接（可留空）', 'Project URL (optional)')}<input type="url" value={link} onChange={event => { setLink(event.target.value); setDirty(true); }} placeholder="https://www.artstation.com/artwork/..." disabled={busy} /></label><p className="editor-link-hint">{t('支持 ArtStation、itch.io、论文或其他作品页面。留空时不会显示外链按钮。', 'ArtStation, itch.io, papers, or other project pages. Empty URLs hide the external-link button.')}</p>
      <div className="editor-footer"><span role="status">{notice ? t(...notice) : ''}</span><button className="button button-accent" type="submit" disabled={busy || reading || !dirty}><Save size={16} />{busy ? t('保存中…', 'Saving…') : t('保存修改', 'Save changes')}</button></div>
    </form>
  </dialog>;
}
