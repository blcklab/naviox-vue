import { defineComponent, h, ref } from 'vue';
import type { NavioxItem } from '@blcklab/naviox';
import { NavioxPalette, defineNavioxTheme } from '../../src/index.ts';
import type { NavioxPaletteVariant } from '../../src/index.ts';

const auroraTheme = defineNavioxTheme({
  colorScheme: 'dark',
  tokens: {
    surface:'#101c25', elevated:'#182b35', text:'#eaf6f3', muted:'#a0b8b4',
    border:'#36515b', hover:'#1d343f', selected:'#244850', soft:'#78a29f',
    accent:'#91d8cc', accentText:'#b4eee1', artStart:'#1e525a', artEnd:'#132334',
    artLine:'#558e8e', shadow:'0 35px 95px rgba(6,19,30,.58)',
  },
});

export const ExampleApp = defineComponent({
  setup() {
    const theme = ref<'ink' | 'sakura' | 'nocturne' | 'aurora' | 'system'>('nocturne');
    const variant = ref<NavioxPaletteVariant>('cinematic');
    const isOpen = ref(true);
    const notice = ref('');
    const items: NavioxItem[] = [
      { id: 'home', title: 'Home', group: 'Destinations', kind: 'route', href: '#home', description: 'A place to begin', preview: { description: 'The opening chapter. Where curiosity becomes something real.', meta: [{label:'Section', value:'01 / Home'}, {label:'Mood', value:'An open sky'}] } },
      { id: 'about', title: 'About', group: 'Destinations', kind: 'route', href: '#about', description: 'The person behind the projects', preview: {description:'A small introduction, the long path, and everything in between.',meta:[{label:'Section',value:'02 / About'}, {label:'Format',value:'Story'}]} },
      { id: 'works', title: 'Selected works', group: 'Destinations', kind: 'route', href: '#works', description: 'Things I couldn’t stop building', preview: {description:'A curated selection of experiments, open-source systems, and thoughtful interfaces.',meta:[{label:'Section',value:'03 / Archive'}, {label:'Status',value:'Active'}]} },
      { id: 'writing', title: 'Field notes', group: 'Destinations', kind: 'route', href: '#writing', description: 'Ideas and small discoveries' },
      { id: 'settings', title: 'Appearance', group: 'Workspace', kind: 'command', description: 'Tune the atmosphere', preview: {description:'Choose the atmosphere for your workspace: light paper, a quiet blossom, or a midnight scene.'} },
      { id: 'ink', parentId: 'settings', title: 'Ink — clean editorial', kind: 'command', perform: () => { theme.value = 'ink'; }, closeOnExecute: false },
      { id: 'sakura', parentId: 'settings', title: 'Sakura — quiet warmth', kind: 'command', perform: () => { theme.value = 'sakura'; }, closeOnExecute: false },
      { id: 'night', parentId: 'settings', title: 'Nocturne — cinematic dark', kind: 'command', perform: () => { theme.value = 'nocturne'; }, closeOnExecute: false },
      { id: 'aurora', parentId: 'settings', title: 'Aurora — a custom theme', kind: 'command', perform: () => { theme.value = 'aurora'; }, closeOnExecute: false },
      { id: 'system', parentId: 'settings', title: 'System — adaptive day/night', kind: 'command', perform: () => { theme.value = 'system'; }, closeOnExecute: false },
      { id: 'sync', title: 'Rebuild the index', group: 'Workspace', kind: 'command', description: 'Simulated async action', perform: async ({signal,reportProgress}) => { reportProgress({message:'Indexing your archive…'}); await new Promise((resolve) => setTimeout(resolve,750)); if(signal.aborted)return; notice.value='Archive updated'; }, closeOnExecute: false },
    ];
    return () => h('div', { class: ['showcase', `showcase-${theme.value}`] }, [
      h('div', { class: 'showcase-planet', 'aria-hidden':'true' }),
      h('header', { class: 'showcase-header' }, [h('strong', 'N / NAVIOX'), h('span', 'AN INTERFACE FOR THE IN-BETWEEN'), h('span', 'M4 · VUE')]),
      h('main', { class:'showcase-main' }, [
        h('span', { class:'showcase-kicker' }, 'THE ARCHIVE IS OPEN — 2026'),
        h('h1', ['Every story', h('i', ' begins somewhere.' )]),
        h('p', 'A keyboard-first space to explore the things you make, and everything that makes you curious.'),
        h('div', { class:'showcase-selectors' }, [
          h('label', ['Theme ', h('select', { value:theme.value, onChange:(event:Event)=>{theme.value=(event.target as HTMLSelectElement).value as typeof theme.value;} }, ['ink','sakura','nocturne','aurora','system'].map(value => h('option', {value}, value)))]),
          h('label', ['Layout ', h('select', { value:variant.value, onChange:(event:Event)=>{variant.value=(event.target as HTMLSelectElement).value as NavioxPaletteVariant;} }, ['floating','minimal','compact','spotlight','cinematic'].map(value => h('option', {value}, value)))]),
        ]),
        h('div', { class:'showcase-ctrls' }, [
          h('button', { type:'button', onClick:()=>isOpen.value=true }, 'Explore the archive ↗'),
          h('span', 'or press Ctrl / ⌘ + K'),
        ]),
        h('small', notice.value),
      ]),
      h(NavioxPalette, {
        items, theme:theme.value, themes:{ aurora:auroraTheme }, variant:variant.value,
        appearance:{ radius: variant.value === 'minimal' ? '13px' : '22px' },
        modelValue:isOpen.value,
        'onUpdate:modelValue':(value:boolean)=>{isOpen.value=value;},
        navigate:(item:NavioxItem)=>{notice.value=`Opened: ${item.title}`;},
        showTrigger:false,
      }),
    ]);
  },
});
