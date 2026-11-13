export const places = [
  {id: 'a', title: '街角咖啡馆', kind: '电影取景线索', note: '一段街角相遇，从这里开始。', source: '待补原始片段及公开出处', condition: '地址、营业与拍摄关联待核对'},
  {id: 'b', title: '河畔小公园', kind: '电影取景线索', note: '沿着河岸，找到故事里的停留。', source: '待补原始片段及公开出处', condition: '开放时段与可进入区域待核对'},
  {id: 'c', title: '旧街书店', kind: '作品关联线索', note: '把喜欢的一页，带进一条街。', source: '待补作品页码及公开出处', condition: '地址、营业与作品关联待核对'}
];

export function initialStart() {
  return {tab: 'explore', selected: 'a', detail: false, handoff: false, source: false, saved: []};
}

export function startTransition(state, action, value) {
  switch (action) {
    case 'place':
      return places.some(place => place.id === value) ? {...state, selected: value, source: false} : state;
    case 'tab':
      return ['explore', 'saved', 'book'].includes(value) ? {...state, tab: value, detail: false, handoff: false, source: false} : state;
    case 'detail': return {...state, detail: true, handoff: false, source: false};
    case 'handoff': return {...state, detail: false, handoff: true, source: false};
    case 'back': return {...state, detail: Boolean(state.handoff), handoff: false, source: false};
    case 'source': return {...state, source: !state.source};
    case 'save': return {...state, saved: state.saved.includes(state.selected) ? state.saved.filter(id => id !== state.selected) : [...state.saved, state.selected]};
    default: return state;
  }
}

export const smallSteps = [
  {title: '找到那份文档', detail: '只找到文件入口，现在不用打开。'},
  {title: '想一个可能的位置', detail: '可能在桌面，也可能在聊天记录。先不用寻找。'},
  {title: '先留下一个提醒', detail: '把“找文档”留在今天，随时可以放下。'}
];

export function initialHug() {
  return {tab: 'now', intent: 'step', step: 0, status: 'preview'};
}

export function hugTransition(state, action, value) {
  switch (action) {
    case 'tab': return ['now', 'step', 'garden'].includes(value) ? {...state, tab: value} : state;
    case 'intent': return ['listen', 'step', 'rest'].includes(value) ? {...state, intent: value} : state;
    case 'smaller': return state.status === 'preview' ? {...state, step: Math.min(state.step + 1, smallSteps.length - 1)} : state;
    case 'accept': return state.status === 'preview' ? {...state, status: 'accepted', tab: 'step'} : state;
    case 'complete': return state.status === 'accepted' ? {...state, status: 'completed'} : state;
    case 'undo': return state.status === 'completed' ? {...state, status: 'accepted'} : state;
    case 'withdraw': return state.status === 'accepted' ? {...state, status: 'preview', tab: 'now'} : state;
    default: return state;
  }
}
