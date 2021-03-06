import MenuComponent from '../components/menu-elements.js';
import {FilterType, MenuItem} from '../utils/const.js';
import {getFilmsByFilter} from '../utils/filter.js';
import {render, replace, RenderPosition} from '../utils/render.js';

export default class MenuController {
  constructor(container, filmsModel, statsComponenet, pageController) {
    this._container = container;
    this._filmsModel = filmsModel;

    this._statsComponenet = statsComponenet;
    this._statsComponenetElement = statsComponenet.getElement();
    this._pageController = pageController;

    this._activeFilterType = FilterType.ALL;
    this._menuComponent = null;

    this._onFilterChange = this._onFilterChange.bind(this);
    this._onDateChange = this._onDateChange.bind(this);
    this._filmsModel.setDataChangeHandler(this._onDateChange);
  }

  render() {
    const container = this._container;
    const allFilms = this._filmsModel.getFilmsAll();
    const filters = Object.values(FilterType).map((filterType) => {
      return {
        title: filterType,
        count: getFilmsByFilter(allFilms, filterType).length
      };
    });
    const oldComponent = this._menuComponent;

    this._menuComponent = new MenuComponent(filters, this._activeFilterType);
    this._menuComponent.setMenuItemChangeHandler(this._onFilterChange);

    if (oldComponent) {
      replace(this._menuComponent, oldComponent);
    } else {
      render(container, this._menuComponent, RenderPosition.BEFOREEND);
    }
  }

  _onFilterChange(filterType) {
    if (filterType === MenuItem.STAT) {
      this._pageController.hide();
      this._statsComponenet.updateFilmsModel(this._filmsModel);
      this._statsComponenet.show();
    } else {
      this._pageController.show();
      this._statsComponenet.hide();
      this._filmsModel.setFilter(filterType);
      this._activeFilterType = filterType;
    }
  }
  _onDateChange() {
    this.render();
  }
}
