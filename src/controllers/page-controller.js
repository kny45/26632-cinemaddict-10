import SortComponent from '../components/sort.js';
import NoFilmsComponent from '../components/no-films.js';
import FilmsListComponent from '../components/films-list.js';
import FilmsListExtraComponent from '../components/films-list-extra.js';
import FilmsListContainerComponent from '../components/films-list-container.js';

import ShowMoreButtonComponent from '../components/show-more-button.js';
import MovieController from './movie-controller.js';

import {FILM_IN_EXTRA_COUNT, SHOWING_FILM_CARDS_COUNT_ON_START, SHOWING_FILM_CARDS_COUNT_BY_BUTTON} from '../utils/const.js';

import {render, remove, RenderPosition} from '../utils/render.js';
import {SortType} from '../components/sort.js';

const renderFilms = (filmList, filmCards, onDataChange, onViewChange, userName, api) => {
  return filmCards.map((film) => {
    const filmController = new MovieController(filmList, onDataChange, onViewChange, userName, api);
    filmController.render(film);
    return filmController;
  });
};

export default class PageController {
  constructor(container, filmsModel, userName, api) {
    this._container = container;
    this._filmsModel = filmsModel;
    this._userName = userName;
    this._api = api;

    this._showedFilmCards = [];
    this._showedFilmControllers = [];
    this._showingFilmCardsCount = SHOWING_FILM_CARDS_COUNT_ON_START;

    this._sortComponent = new SortComponent();
    this._noFilmsComponent = new NoFilmsComponent();
    this._filmsList = new FilmsListComponent();
    this._filmsListContainer = new FilmsListContainerComponent();
    this._showMoreButtonComponent = new ShowMoreButtonComponent();
    this._mostCommentedFilmsComponent = new FilmsListExtraComponent(`Most Commented`);
    this._mostCommentedFilmsContainerComponent = new FilmsListContainerComponent();
    this._topRatedFilmsComponent = new FilmsListExtraComponent(`Top Rated`);
    this._topRatedFilmsContainerComponent = new FilmsListContainerComponent();

    this._onSortTypeChange = this._onSortTypeChange.bind(this);
    this._onDataChange = this._onDataChange.bind(this);
    this._onViewChange = this._onViewChange.bind(this);
    this._onFilterChange = this._onFilterChange.bind(this);

    this._sortComponent.setSortTypeChangeHandler(this._onSortTypeChange);
    this._filmsModel.setFilterChangeHandler(this._onFilterChange);
  }

  render() {
    this._showedFilmCards = this._filmsModel.getFilms();

    const container = this._container.getElement();
    render(container, this._sortComponent, RenderPosition.BEFOREBEGIN);

    const filmsList = this._filmsList.getElement();

    if (this._showedFilmCards.length === 0) {
      render(container, this._noFilmsComponent, RenderPosition.BEFOREEND);
      return;
    }

    render(container, this._filmsList, RenderPosition.BEFOREEND);
    render(filmsList, this._filmsListContainer, RenderPosition.BEFOREEND);
    this._renderFilms(this._showedFilmCards.slice(0, this._showingFilmCardsCount));
    this._renderShowMoreButton();
    this._renderExtraCard();
  }

  _renderExtraCard() {
    const container = this._container.getElement();
    // TopRated, MostCommented
    const getTopRatedFilms = (allFilmCards) => {
      const ratedFilms = allFilmCards.slice();
      return ratedFilms.sort((a, b) => a.rating > b.rating ? 1 : -1).slice(-1 * FILM_IN_EXTRA_COUNT);
    };
    const getMostCommentedFilms = (allFilmCards) => {
      const ratedFilms = allFilmCards.slice();
      return ratedFilms.sort((a, b) => a.commentsCount > b.commentsCount ? 1 : -1).slice(-1 * FILM_IN_EXTRA_COUNT);
    };
    const topRatedCards = getTopRatedFilms(this._filmsModel.getFilmsAll());
    const mostCommentedCards = getMostCommentedFilms(this._filmsModel.getFilmsAll());
    // первые две карточки -> Top rated
    if (topRatedCards[FILM_IN_EXTRA_COUNT - 1].rating !== 0) {
      const topRatedList = this._topRatedFilmsComponent.getElement();
      const topRatedContainer = this._topRatedFilmsContainerComponent.getElement();
      render(container, this._topRatedFilmsComponent, RenderPosition.BEFOREEND);
      render(topRatedList, this._topRatedFilmsContainerComponent, RenderPosition.BEFOREEND);
      renderFilms(topRatedContainer, topRatedCards, this._onDataChange, this._onViewChange, this._userName, this._api);
    }
    // следующие две -> Most commented
    if (mostCommentedCards[FILM_IN_EXTRA_COUNT - 1].commentsCount !== 0) {
      const mostCommentedList = this._mostCommentedFilmsComponent.getElement();
      const mostCommentedContainer = this._mostCommentedFilmsContainerComponent.getElement();
      render(container, this._mostCommentedFilmsComponent, RenderPosition.BEFOREEND);
      render(mostCommentedList, this._mostCommentedFilmsContainerComponent, RenderPosition.BEFOREEND);
      renderFilms(mostCommentedContainer, mostCommentedCards, this._onDataChange, this._onViewChange, this._userName, this._api);
    }
  }
  _rerenderExtraCard() {
    const topRatedContainer = this._topRatedFilmsContainerComponent.getElement();
    topRatedContainer.innerHTML = ``;
    const mostCommentedContainer = this._mostCommentedFilmsContainerComponent.getElement();
    mostCommentedContainer.innerHTML = ``;
    this._renderExtraCard();
  }

  _onSortTypeChange(sortType) {
    this._removeFilms();
    remove(this._showMoreButtonComponent);

    const films = this._filmsModel.getFilms();
    this._showingFilmCardsCount = SHOWING_FILM_CARDS_COUNT_ON_START;

    switch (sortType) {
      case SortType.DATE:
        this._showedFilmCards = films.slice().sort((a, b) => b.year - a.year);
        break;
      case SortType.RATING:
        this._showedFilmCards = films.slice().sort((a, b) => b.rating - a.rating);
        break;
      case SortType.DEFAULT:
        this._showedFilmCards = films.slice();
        break;
    }

    this._renderFilms(this._showedFilmCards.slice(0, this._showingFilmCardsCount));
    this._renderShowMoreButton();
  }

  _renderShowMoreButton() {
    remove(this._showMoreButtonComponent);
    if (this._showingFilmCardsCount >= this._showedFilmCards.length) {
      return;
    } else {
      const filmsList = this._filmsList.getElement();
      render(filmsList, this._showMoreButtonComponent, RenderPosition.BEFOREEND);

      const filmsListContainer = this._filmsListContainer.getElement();
      this._showMoreButtonComponent.setClickHandler(() => {
        const prevFilmsCount = this._showingFilmCardsCount;
        this._showingFilmCardsCount = this._showingFilmCardsCount + SHOWING_FILM_CARDS_COUNT_BY_BUTTON;

        renderFilms(filmsListContainer, this._showedFilmCards.slice(prevFilmsCount, this._showingFilmCardsCount), this._onDataChange, this._onViewChange, this._userName, this._api);
        if (this._showingFilmCardsCount >= this._showedFilmCards.length) {
          remove(this._showMoreButtonComponent);
        }
      });
    }
  }

  _onDataChange(filmController, oldData, newData) {
    this._api.updateFilm(oldData.id, newData)
    .then((updatedFilm) => {
      const isSuccess = this._filmsModel.updateFilm(oldData.id, updatedFilm);
      if (isSuccess) {
        filmController.render(updatedFilm);
        this._rerenderExtraCard();

        if (!this._showedFilmControllers.includes(filmController, 0)) { // если наш контроллер в extra-блоке, то обновим карточку в основном блоке
          const filmControllerInFilmList = this._showedFilmControllers.find((it) => it.getFilmCardId() === filmController.getFilmCardId());
          if (filmControllerInFilmList) {
            filmControllerInFilmList.render(updatedFilm);
          }
        }
      }
    });
  }

  _onViewChange() {
    this._showedFilmControllers.forEach((it) => it.setDefaultView());
  }

  _removeFilms() {
    const filmsListContainer = this._filmsListContainer.getElement();
    filmsListContainer.innerHTML = ``;
    this._showedFilmControllers = [];
    this._showedFilmCards = [];
  }

  _renderFilms(films) {
    const filmsListContainer = this._filmsListContainer.getElement();
    const newFilms = renderFilms(filmsListContainer, films, this._onDataChange, this._onViewChange, this._userName, this._api);
    this._showedFilmControllers = this._showedFilmControllers.concat(newFilms);
    this._showingFilmCardsCount = this._showedFilmControllers.length;
  }

  _onFilterChange() {
    this._removeFilms();
    this._showedFilmCards = this._filmsModel.getFilms();
    this._renderFilms(this._filmsModel.getFilms().slice(0, SHOWING_FILM_CARDS_COUNT_ON_START));
    this._renderShowMoreButton();
  }

  hide() {
    this._container.hide();
    this._sortComponent.hide();
  }

  show() {
    this._container.show();
    this._sortComponent.show();
  }
}
