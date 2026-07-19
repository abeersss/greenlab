const $ = x => document.getElementById(x);
let ar = false;

$('lang').onclick = () => {
  ar = !ar;
  document.documentElement.dir = ar ? 'rtl' : 'ltr';
  $('lang').textContent = ar ? 'English' : 'العربية';
  $('tag').textContent = ar ? 'تعلّم بالممارسة' : 'LEARN BY DOING';
  $('head').textContent = ar ? 'تعلم الأمن السيبراني بطريقة ممتعة.' : 'Cybersecurity learning, made playful.';
  $('intro').textContent = ar
    ? 'ألغاز بصرية عملية عبر ستة مسارات أمنية، ونضيف غرفًا جديدة كل أسبوع.'
    : 'Visual, hands-on puzzles across six security paths, with more rooms added every week.';
  $('pathTitle').textContent = ar ? 'مسارات التعلم' : 'Learning paths';
  $('pathsNavLabel').textContent = ar ? 'استكشف كل المسارات' : 'Explore all paths';
};
