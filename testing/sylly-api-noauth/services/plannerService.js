function planTasks({ items, constraints = [], prefs = {} }) {
  const dailyCapMin = prefs.dailyCapMin ?? 180;
  const blockMin = prefs.blockMin ?? 50;
  const dayStart = 8;
  const dayEnd = 22;

  const estimate = (i) => {
    switch (i.type) {
      case 'EXAM':
      case 'PROJECT': return 240;
      case 'HOMEWORK': return 120;
      case 'READING': return 90;
      default: return 60;
    }
  };

  const tasks = [];
  const sorted = [...items].sort((a,b)=> new Date(a.dueDate||'2100').getTime() - new Date(b.dueDate||'2100').getTime());

  for (const it of sorted) {
    let need = estimate(it);
    let cursor = it.dueDate ? new Date(it.dueDate) : new Date(Date.now()+7*864e5);
    cursor.setHours(dayEnd,0,0,0);
    let usedToday = 0;
    while (need > 0) {
      const start = new Date(cursor.getTime() - blockMin*60*1000);
      if (start.getHours() < dayStart || usedToday + blockMin > dailyCapMin) {
        cursor.setDate(cursor.getDate()-1);
        cursor.setHours(dayEnd,0,0,0);
        usedToday = 0;
        continue;
      }
      tasks.push({ title:`Study: ${it.title}`, start, end:new Date(cursor), flexible:true, itemId: it.id ?? null });
      need -= blockMin;
      usedToday += blockMin;
      cursor = start;
    }
  }
  return tasks;
}
module.exports = { planTasks };
