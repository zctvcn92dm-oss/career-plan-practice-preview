const practiceKey = 'careerPlanPracticeRecords:v1';
const practiceTypes = {'岗位实践':['实习','兼职','企业实践'], '生涯活动':['职业讲座','企业参访','职业体验']};
const practiceButton = 'rounded-control bg-brand/15 px-3 py-2 text-[12px] font-bold text-deep';
const practicePanel = 'rounded-control border border-line bg-white p-4';
let practiceNewest = true;
function practiceHomeRow(){return `<button type="button" class="ref-home-record" onclick="navigate('records')"><i class="fa-solid fa-book" aria-hidden="true"></i><span><strong>实践记录</strong><small>记录实习、兼职和生涯活动</small></span><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>`;}
let practiceId = null;
let practiceOrigin = 'records';
let practiceDraftDirty = false;
let practiceSaving = false;

function practiceEscape(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function getPracticeRecords() {
  try { return JSON.parse(localStorage.getItem(practiceKey) || '[]'); } catch { return []; }
}
function practiceRecordEntry(inReport) {
  return `<aside class="${practicePanel} mt-3 journal-entry"><span class="journal-kicker">成长手记</span><h3 class="text-[14px] font-bold">我的实践记录</h3>
    <p class="my-2 text-[11px] text-body">记录做过的实践和个人收获，随时回看实践轨迹。</p>
    <div class="flex flex-wrap gap-2"><button class="${practiceButton}" onclick="openPracticeForm()">${inReport?'记录一次实践':'记一条'}</button>
    ${inReport?'':`<button class="${practiceButton}" onclick="navigate('records')">查看记录 ›</button>`}</div></aside>`;
}
function openPracticeForm() {
  practiceId = appState.page === 'recordDetail' ? practiceId : null;
  practiceOrigin = appState.page;
  practiceDraftDirty = false;
  navigate('recordForm');
}
function practiceBack() {
  if (practiceSaving || (appState.page === 'recordForm' && practiceDraftDirty && !confirm('还有未保存的内容，确定离开吗？'))) return;
  practiceDraftDirty = false;
  goBack();
}
function practiceDetail(id) {
  practiceId = id;
  navigate('recordDetail');
}
function practiceHeader(title, body) {
  return `<div class="journal-page"><header class="journal-header sticky top-0 z-20"><button aria-label="返回" onclick="practiceBack()">‹</button><h1>${title}</h1></header>
    <main class="journal-main">${body}</main></div>`;
}
function practiceDate(record) {
  return record.start + (record.mode === 'range' ? ' 至 ' + record.end : record.mode === 'ongoing' ? ' 至今 · 进行中' : '');
}
function practiceRecordPage() {
  const page = appState.page;
  if (!['records','archive','recordDetail','recordForm'].includes(page)) return null;
  const records = getPracticeRecords();
  const item = records.find(record => record.id === practiceId);
  if (page === 'recordForm') return practiceHeader(item?'编辑实践记录':'记录一次实践', practiceForm(item));
  if (page === 'recordDetail') {
    if (!item) return practiceHeader('实践记录', '<p>这条记录已不存在。</p>');
    return practiceHeader('实践记录', `<article class="${practicePanel} journal-detail space-y-3 break-words">
      <p class="text-[11px] text-deep">学生自主记录 · ${practiceEscape(item.category)} / ${practiceEscape(item.type)}</p>
      <h2 class="text-[17px] font-bold">${practiceEscape(item.name)}</h2><p class="text-[12px] text-body">${practiceEscape(practiceDate(item))}${item.org?' · '+practiceEscape(item.org):''}</p>
      <h3 class="text-[13px] font-bold">我做了什么</h3><p class="whitespace-pre-wrap text-[12px] text-body">${practiceEscape(item.work)}</p>
      <section class="journal-reflection"><h3 class="text-[13px] font-bold">我的收获</h3>${item.takeaway?`<p class="whitespace-pre-wrap text-[12px] text-body">${practiceEscape(item.takeaway)}</p>`:`<button class="${practiceButton}" onclick="openPracticeForm()">补充我的收获</button>`}</section>
      ${(item.files||[]).filter(file=>/^data:(image\/(png|jpeg|webp)|application\/pdf);base64,/i.test(file.data)).map(file=>`<a class="block text-[12px] text-deep" href="${practiceEscape(file.data)}" download="${practiceEscape(file.name)}">下载附件：${practiceEscape(file.name)}</a>`).join('')}
      <div class="journal-utilities flex gap-3"><button class="${practiceButton}" onclick="openPracticeForm()">编辑</button><button class="${practiceButton}" onclick="deletePracticeRecord()">删除</button></div></article>`);
  }
  const archive=page==='archive';
  const intro=`<section class="journal-intro ${archive?'ref-archive-intro':'ref-list-intro'}"><div><span class="journal-kicker">${archive?'实践时间线':'成长手记'} · ${records.length} 条记录</span><h2>${archive?'按时间回看你的实践经历':'记录实践，留下收获'}</h2>
    <p>${archive?'从最近一次实践开始，回看你做过的事和留下的收获。<br>记录由你填写，仅保存在当前浏览器，不代表学校认证。':'记录实习、兼职、企业实践或生涯活动，可随时补充。'}</p>
    ${archive?'':`<div class="ref-actions"><button onclick="openPracticeForm()"><i class="fa-regular fa-pen-to-square"></i> 记一条</button><button onclick="navigate('archive')"><i class="fa-solid fa-route"></i> 实践记录轨迹</button></div>`}</div></section>`;
  const tools=archive?'':`<div class="ref-list-tools"><strong><i class="fa-regular fa-clock"></i> 实践记录时间线</strong><button onclick="practiceNewest=!practiceNewest;render()">${practiceNewest?'最新在前':'最早在前'} <i class="fa-solid fa-chevron-down"></i></button></div>`;
  const cards=records.sort((a,b)=>(archive||practiceNewest?1:-1)*(b.start.localeCompare(a.start)||b.updated-a.updated)).map(record=>`<button class="journal-record ref-record" onclick="practiceDetail('${record.id}')"><span class="journal-meta"><span class="journal-tag">${practiceEscape(record.type)}</span><i class="fa-regular fa-calendar"></i> ${practiceEscape(practiceDate(record).replace(' · 进行中',''))}${record.mode==='ongoing'?'<b>· 进行中</b>':''}</span><strong>${practiceEscape(record.name)}</strong><span class="journal-snippet">${practiceEscape(record.takeaway||'可补充收获')}</span><i class="fa-solid ${archive?(record.mode==='ongoing'?'fa-briefcase':'fa-calendar-days'):'fa-chevron-right'} ref-card-icon" aria-hidden="true"></i></button>`).join('');
  return practiceHeader(archive?'实践记录轨迹':'我的实践记录',`<div class="${archive?'ref-archive':'ref-list'}">${intro}${tools}${cards?`<div class="journal-timeline">${cards}</div>`:`<p class="journal-empty">还没有实践记录。实习、兼职、企业参访，都可以从一条记录开始。</p>`}${archive?'':`<div class="ref-list-end"><img src="./assets/practice-reference-b.png" alt="">继续记录更多实践经历吧～</div>`}</div>`);
}
function practiceForm(item = {}) {
  const field = 'mt-1 w-full rounded-lg border border-line bg-page p-2 text-[13px]';
  const fieldIcons={category:'fa-briefcase',type:'fa-graduation-cap',mode:'fa-calendar',start:'fa-calendar',end:'fa-calendar',org:'fa-building',work:'fa-pen',takeaway:'fa-seedling'};
  const label = (name, control) => {
    const iconName=fieldIcons[control.match(/name="([^"]+)"/)?.[1]];
    return `<label class="ref-field block text-[12px] font-medium">${name.replace(/（(必填|选填)）/g,'（<em>$1</em>）')}<span class="ref-field-control ${iconName?'has-icon':''}">${iconName?`<i aria-hidden="true" class="fa-solid ${iconName}"></i>`:''}${control}</span></label>`;
  };
  const input = (name, value, attrs='') => `<input class="${field}" name="${name}" value="${practiceEscape(value)}" ${attrs}>`;
  const area = (name, value, attrs) => `<span class="ref-textarea"><textarea class="${field}" name="${name}" rows="3" maxlength="300" oninput="this.nextElementSibling.textContent=this.value.length+'/300'" ${attrs}>${practiceEscape(value)}</textarea><small>${(value||'').length}/300</small></span>`;
  const options = (values, selected) => Object.entries(values).map(([value,title])=>`<option value="${value}" ${value===selected?'selected':''}>${title}</option>`).join('');
  const category = item.category || '岗位实践';
  return `<form class="journal-form" oninput="practiceDraftDirty=true" onsubmit="savePracticeRecord(event)">
    <section class="journal-group ref-form-grid"><h2><i class="fa-solid fa-address-card"></i> 经历信息</h2>
    ${label('经历分类（必填）', `<select class="${field}" name="category" onchange="syncPracticeFields(this.form)">${options({'岗位实践':'岗位实践','生涯活动':'生涯活动'},category)}</select>`)}
    ${label('经历类型（必填）', `<select class="${field}" name="type" required>${practiceTypes[category].map(type=>`<option ${type===item.type?'selected':''}>${type}</option>`).join('')}</select>`)}
    ${label('经历名称（必填）',input('name',item.name,'required maxlength="60" placeholder="例如：自动化产线参访"'))}
    ${label('时间形式（必填）', `<select class="${field}" name="mode" onchange="syncPracticeFields(this.form)">${options({single:'单日',range:'时间段',ongoing:'进行中'},item.mode||'single')}</select>`)}
    ${label('活动日期 / 开始日期（必填）',input('start',item.start,'required type="date"'))}
    <div id="practiceEndRow" ${item.mode==='range'?'':'hidden'}>${label('结束日期（必填）',input('end',item.end,'type="date" '+(item.mode==='range'?'required':'disabled')))}</div>
    ${label('单位或组织（选填）',input('org',item.org,'maxlength="80" placeholder="请输入单位或组织"'))}
    </section><section class="journal-group"><h2><i class="fa-solid fa-clipboard"></i> 我做了什么</h2>
    ${label('实践内容（必填）',area('work',item.work,'required placeholder="写一句你实际做过的事"'))}
    </section><section class="journal-group"><h2><i class="fa-solid fa-seedling"></i> 我的收获</h2>
    ${label('个人收获（选填）',area('takeaway',item.takeaway,'placeholder="你发现自己喜欢什么？下次想再练什么？"'))}
    ${label('照片或作品（选填，支持图片或 PDF，单个不超过 1 MB）',`<input class="${field}" type="file" name="attachment" accept="image/png,image/jpeg,image/webp,application/pdf">`)}
    ${item.files?.length?`<label class="block text-[12px]"><input type="checkbox" name="removeFiles"> 移除已有附件（${item.files.length}）</label>`:''}
    </section><div class="journal-save"><p id="practiceError" class="text-[12px] text-red-700" role="alert"></p>
    <button type="submit" class="primary-action w-full"><i class="fa-solid fa-circle-check"></i> 保存记录</button></div>
  </form>`;
}
function syncPracticeFields(form) {
  const {category,type,mode,end} = form.elements;
  if (!practiceTypes[category.value].includes(type.value)) type.replaceChildren(...practiceTypes[category.value].map(label=>new Option(label)));
  end.required = mode.value === 'range';
  end.disabled = !end.required;
  document.getElementById('practiceEndRow').hidden = end.disabled;
}
async function savePracticeRecord(event) {
  event.preventDefault();
  if (practiceSaving) return;
  const form = event.currentTarget;
  const error = form.querySelector('[role="alert"]');
  const data = new FormData(form);
  const value = key => String(data.get(key)||'').trim();
  if (!value('name') || !value('work')) { error.textContent='请填写经历名称和实际完成的任务。'; return; }
  if (value('mode')==='range' && value('end')<value('start')) { error.textContent='结束日期不能早于开始日期。'; return; }
  practiceSaving = true;
  form.querySelector('[type="submit"]').disabled = true;
  error.textContent = '';
  try {
    const records = getPracticeRecords();
    const old = records.find(record=>record.id===practiceId);
    const fields = Object.fromEntries(['name','category','type','mode','start','end','org','work','takeaway'].map(key=>[key,value(key)]));
    const files = data.has('removeFiles') ? [] : [...(old?.files||[])];
    const attachment = data.get('attachment');
    if (attachment?.size) {
      if (attachment.size > 1024*1024 || !['image/png','image/jpeg','image/webp','application/pdf'].includes(attachment.type)) throw Error('附件格式不支持或超过 1 MB，可更换附件或清除后保存正文。');
      const url = await new Promise((resolve,reject)=>{
        const reader = new FileReader();
        reader.onload = ()=>resolve(reader.result);
        reader.onerror = ()=>reject(Error('附件读取失败，可重试或清除后保存正文。'));
        reader.readAsDataURL(attachment);
      });
      files.push({name:attachment.name,data:url});
    }
    const id = old?.id || 'practice-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
    localStorage.setItem(practiceKey,JSON.stringify([...records.filter(record=>record.id!==id),{id,...fields,files,updated:Date.now()}]));
    practiceDraftDirty = false;
    if (old || practiceOrigin==='records') goBack();
    else { appState.page='records'; render(); window.scrollTo(0,0); }
    toast('实践记录已保存');
  } catch (failure) {
    error.textContent = failure instanceof DOMException ? '暂未保存。请重试，或移除附件后保存正文。' : failure.message;
  } finally {
    practiceSaving = false;
    form.querySelector('[type="submit"]').disabled = false;
  }
}
function deletePracticeRecord() {
  if (!confirm('删除后，这条经历也将从实践记录轨迹中移除。')) return;
  try {
    localStorage.setItem(practiceKey,JSON.stringify(getPracticeRecords().filter(record=>record.id!==practiceId)));
    goBack();
    toast('实践记录已删除');
  } catch { toast('暂未删除，请重试'); }
}
