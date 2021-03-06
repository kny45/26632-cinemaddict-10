import AbstractComponent from './abstract-component.js';

const createLoadingTemplate = () => {
  return (
    `<div>
      <nav class="main-navigation">
        <a href="#all" class="main-navigation__item main-navigation__item--active">All movies</a>
        <a href="#watchlist" class="main-navigation__item">Watchlist <span class="main-navigation__item-count">13</span></a>
        <a href="#history" class="main-navigation__item">History <span class="main-navigation__item-count">4</span></a>
        <a href="#favorites" class="main-navigation__item">Favorites <span class="main-navigation__item-count">8</span></a>
        <a href="#stats" class="main-navigation__item main-navigation__item--additional">Stats</a>
      </nav>

      <ul class="sort">
        <li><a href="#" class="sort__button sort__button--active">Sort by default</a></li>
        <li><a href="#" class="sort__button">Sort by date</a></li>
        <li><a href="#" class="sort__button">Sort by rating</a></li>
      </ul>

      <section class="films">
        <section class="films-list">
          <h2 class="films-list__title">Loading...</h2>
        </section>
      </section>
    </div>`
  );
};

export default class Loading extends AbstractComponent {
  constructor() {
    super();
  }

  getTemplate() {
    return createLoadingTemplate(this._headerProfile);
  }
}
