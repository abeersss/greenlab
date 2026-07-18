const C = [
  ['Firewall', 'جدار الحماية', '#ed645d'],
  ['WAF', 'جدار حماية تطبيقات الويب', '#1a9b70'],
  ['DMZ', 'المنطقة المعزولة', '#8052bb'],
  ['VLAN', 'الشبكة الافتراضية', '#2876c8']
];
const $ = x => document.getElementById(x);
let ar = false;

function draw() {
  $('cards').innerHTML = C.map(x =>
    '<div class="card" draggable="true" data-a="' + x[0] + '" style="--c:' + x[2] + '">' +
    (ar ? x[1] : x[0]) + '</div>'
  ).join('');

  document.querySelectorAll('.card').forEach(c => {
    c.ondragstart = e => e.dataTransfer.setData('text/plain', c.dataset.a);
  });

  document.querySelectorAll('.drop').forEach(d => {
    d.ondragover = e => { e.preventDefault(); d.classList.add('over'); };
    d.ondragleave = () => d.classList.remove('over');
    d.ondrop = e => {
      e.preventDefault();
      d.classList.remove('over');
      let a = e.dataTransfer.getData('text/plain');
      if (d.querySelector('.placed')) return;
      let z = document.createElement('div');
      z.className = 'placed';
      z.dataset.a = a;
      z.textContent = ar ? C.find(x => x[0] === a)[1] : a;
      d.textContent = '';
      d.appendChild(z);
      let c = document.querySelector('.card[data-a="' + a + '"]');
      if (c) c.style.display = 'none';
    };
  });
}
draw();

$('check').onclick = () => {
  let n = 0;
  document.querySelectorAll('.drop').forEach(d => {
    let z = d.querySelector('.placed');
    d.classList.remove('correct', 'wrong');
    if (z) {
      let ok = z.dataset.a === d.dataset.a;
      d.classList.add(ok ? 'correct' : 'wrong');
      if (ok) n++;
    }
  });
  $('feedback').className = 'feedback ' + (n === 4 ? 'good' : 'bad');
  $('feedback').textContent = n === 4
    ? (ar ? 'ممتاز! الشبكة محمية. +50 XP' : 'Excellent! Network defended. +50 XP')
    : (ar ? n + ' من 4 صحيحة. حاول مرة أخرى.' : n + ' of 4 are correct. Try again.');
  if (n === 4 && window.GreenLabGame) window.GreenLabGame.recordCompletion('network', 50);
};

$('lang').onclick = () => {
  ar = !ar;
  document.documentElement.dir = ar ? 'rtl' : 'ltr';
  $('lang').textContent = ar ? 'English' : 'العربية';
  $('tag').textContent = ar ? 'تعلّم بالممارسة' : 'LEARN BY DOING';
  $('head').textContent = ar ? 'تعلم الأمن السيبراني بطريقة ممتعة.' : 'Cybersecurity learning, made playful.';
  $('intro').textContent = ar ? 'ألغاز بصرية بسيطة لممارسة الأمن السيبراني بأمان.' : 'Simple visual puzzles for safe cybersecurity practice.';
  $('networkTitle').textContent = ar ? 'لغز أمن الشبكات' : 'Network Security Puzzle';
  $('networkIntro').textContent = ar ? 'اسحب كل أداة حماية إلى أفضل موقع في الرسم الشبكي.' : 'Drag each control to its best location in the network diagram.';
  draw();
};
