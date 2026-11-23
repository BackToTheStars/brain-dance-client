'use client';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useLocale, useTranslations } from 'next-intl';
import { DragOutlined, SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { TID } from '@/config/testIds';
import { gameViewUrl } from '@/modules/lobby/helpers/shareParams';
import { moveField } from '@/modules/turns/redux/actions';
import { getNavigatorPage } from '@/modules/turns/requests';
import { freeCenter, useNavigatorBounds } from './useNavigatorBounds';

const icons = {
  comment: 'comment', picture: 'image', 'picture-only': 'image', audio: 'music',
  video: 'video', pdf: 'file-pdf', md: 'file-alt', translation: 'language',
};

function Highlight({ text, query }) {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) return text;
  return <>{text.slice(0, at)}<mark>{text.slice(at, at + query.length)}</mark>{text.slice(at + query.length)}</>;
}

function Results({ hash, query, navigate }) {
  const t = useTranslations('Game.navigator');
  const locale = useLocale();
  const root = useRef(null);
  const end = useRef(null);
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState('');
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  // Saves do not reload the list. A turn that leaves the store while the list is open drops out;
  // one this client has not loaded yet stays and opens by its link.
  const store = useStore();
  const [gone, setGone] = useState(() => new Set());
  useEffect(() => {
    let known = store.getState().turns.g;
    return store.subscribe(() => {
      const current = store.getState().turns.g;
      if (current === known) return;
      const lost = Object.keys(known).filter(id => !current[id]);
      known = current;
      if (lost.length) setGone(previous => new Set([...previous, ...lost]));
    });
  }, [store]);
  const shown = items.filter(item => !gone.has(item._id));

  useEffect(() => {
    if (cursor === null) return;
    const controller = new AbortController();
    let observer;
    async function loadPage() {
      try {
        const page = await getNavigatorPage(hash, query, cursor, controller.signal);
        if (controller.signal.aborted) return;
        setItems(previous => previous.concat(page.items));
        setStatus('ready');
        if (!page.next) {
          setCursor(null);
          return;
        }
        observer = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && !controller.signal.aborted) {
            observer.disconnect();
            setStatus('loading');
            setCursor(page.next);
          }
        }, { root: root.current, rootMargin: '120px' });
        observer.observe(end.current);
      } catch {
        if (!controller.signal.aborted) setStatus('error');
      }
    }
    loadPage();
    return () => { controller.abort(); observer?.disconnect(); };
  }, [hash, query, cursor, attempt]);

  return <div className="navigator-results" ref={root}>
    <ul>{shown.map(item => {
      const type = Object.hasOwn(icons, item.contentType) ? item.contentType : 'turn';
      const typeName = t('types.' + type);
      const title = item.title || typeName;
      return <li key={item._id} data-test-id={TID.navigator.item} data-turn-id={item._id}>
        <i className={'fa fa-' + (icons[type] || 'file')} title={typeName} aria-label={typeName} />
        <a href={gameViewUrl(hash, { focusTurnId: item._id })} title={title}
          onClick={event => navigate(event, item._id)}><Highlight text={title} query={query} /></a>
        {item.createdAt && <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString(locale)}</time>}
        <small>{item.column && t(item.column) + ' · '}<Highlight text={item.snippet || typeName} query={query} /></small>
      </li>;
    })}</ul>
    <div ref={end} className="navigator-end" />
    <div role="status">{status === 'loading' && t('loading')}
      {status === 'ready' && cursor === null && !shown.length && t('empty')}
      {status === 'error' && <>{t('failed')} <button className="btn btn-primary" onClick={() => {
        setStatus('loading'); setAttempt(n => n + 1);
      }}>{t('retry')}</button></>}
    </div>
  </div>;
}

export default function TurnNavigator() {
  const t = useTranslations('Game.navigator');
  const dispatch = useDispatch();
  const store = useStore();
  const hash = useSelector(state => state.game.game.hash);
  const ref = useRef(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim().replace(/\s+/g, ' ')), 500);
    return () => clearTimeout(timer);
  }, [search]);
  useNavigatorBounds(ref);

  function navigate(event, id) {
    if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const { game, turns } = store.getState();
    const turn = turns.g[id];
    if (!turn) return;
    event.preventDefault();
    const target = freeCenter(ref.current.parentElement.getBoundingClientRect(), window.innerWidth, window.innerHeight);
    dispatch(moveField({
      left: turn.position.x + turn.size.width / 2 - game.position.x - target.x / game.zoom,
      top: turn.position.y + turn.size.height / 2 - game.position.y - target.y / game.zoom,
    }));
  }

  return <section ref={ref} aria-label={t('title')} data-test-id={TID.navigator.panel}>
    <header className="navigator-header">
      <DragOutlined /><strong>{t('title')}</strong>
    </header>
    <div className="navigator-filter"><Input allowClear prefix={<SearchOutlined />} maxLength={200}
      value={search} placeholder={t('search')} aria-label={t('search')} data-test-id={TID.navigator.search}
      onChange={e => setSearch(e.target.value)} /></div>
    <Results key={JSON.stringify([hash, query])} hash={hash} query={query} navigate={navigate} />
  </section>;
}
