import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { gameCategories, favoriteGames } from './favoriteGames.js';
import { CoverGlare, Reveal } from './effects/PortfolioMotion.jsx';
import ResponsiveImage from './ResponsiveImage.jsx';

function FavoriteGame({ game, t }) {
  const [failed, setFailed] = useState(false);
  return <a className="favorite-game" href={game.url} target="_blank" rel="noopener noreferrer" data-game-id={game.id} aria-label={t(`查看 ${game.title[0]} 的官方页面`, `Visit the official page for ${game.title[1]}`)}>
    <CoverGlare className="favorite-game-art" glareOpacity={0.16}>
      {failed ? <Gamepad2 size={26} strokeWidth={1.3} aria-hidden="true" /> : <ResponsiveImage src={game.image} sizeHint="game" alt={t(`${game.title[0]} 游戏画面`, `${game.title[1]} game artwork`)} loading="lazy" onError={() => setFailed(true)} />}
    </CoverGlare>
    <h4>{t(...game.title)}</h4>
  </a>;
}

export default function FavoriteGamesSection({ t }) {
  return <section className="favorite-games section-space" id="games" aria-labelledby="games-title"><div className="container">
    <Reveal className="section-label" distance={10}><span className="section-number">04</span><span>{t('喜欢的游戏 / 个人喜好', 'GAMES I LOVE / PERSONAL FAVORITES')}</span><span className="label-line" /></Reveal>
    <Reveal className="section-heading"><div><h2 id="games-title">{t('喜欢的', 'GAMES I ')}<em>{t('游戏。', 'LOVE.')}</em></h2><p>{t('我喜欢的游戏，按类型整理。', 'A few of my favorite games, grouped by genre.')}</p></div></Reveal>
    <div className="favorite-game-groups">
      {gameCategories.map((category, index) => <Reveal as="section" className="favorite-game-group" key={category.id} data-game-group={category.id} aria-labelledby={`games-${category.id}`} distance={22} duration={0.65} delay={(index % 2) * 0.08}>
        <h3 id={`games-${category.id}`}>{t(...category.label)}</h3>
        <div className="favorite-game-list">{favoriteGames.filter(game => game.category === category.id).map(game => <FavoriteGame key={game.id} game={game} t={t} />)}</div>
      </Reveal>)}
    </div>
    <p className="favorite-art-credit">{t('游戏图片版权归各自权利人所有。', 'Game artwork belongs to its respective owners.')}</p>
  </div></section>;
}
