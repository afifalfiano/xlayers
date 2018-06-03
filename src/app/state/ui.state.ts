import { MatSnackBar } from '@angular/material/snack-bar';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { PageState } from './page.state';

export interface UiSettings {
  currentPage?: SketchMSLayer;
  currentLayer?: SketchMSLayer;
  previousLayer?: SketchMSLayer;
  availablePages?: Array<SketchMSPage>;
  wireframe?: boolean;
  preview?: boolean;
  settingsEnabled?: boolean;
  zoomLevel: number;
  is3dView: boolean;
}

export class ShowWireframe {
  static readonly type = '[UiSettings] Show Wireframe';
}

export class HideWireframe {
  static readonly type = '[UiSettings] Hide Wireframe';
}
export class ShowPreview {
  static readonly type = '[UiSettings] Show Preview';
}

export class HidePreview {
  static readonly type = '[UiSettings] Hide Preview';
}
export class AvailablePages {
  static readonly type = '[UiSettings] Available Pages';
  constructor(public pages: SketchMSPage[]) {}
}

export class CurrentPage {
  static readonly type = '[UiSettings] Current Page';
  constructor(public page: SketchMSPage) {}
}

export class CurrentLayer {
  static readonly type = '[UiSettings] Current Layer';
  constructor(public layer: SketchMSLayer) {}
}

export class SettingsEnabled {
  static readonly type = '[UiSettings] Enable Settings';
}
export class AutoFixCurrentPagePosition {
  static readonly type = '[UiSettings] Auto Fix Current Page Position';
  constructor(public page: SketchMSLayer) {}
}
export class ZoomIn {
  static readonly type = '[UiSettings] Zoom In';
  constructor(public value: number = 0.1) {}
}
export class ZoomOut {
  static readonly type = '[UiSettings] Zoom Out';
  constructor(public value: number = 0.1) {}
}
export class Toggle3D {
  static readonly type = '[UiSettings] Toggle 3D';
  constructor(public value: boolean) {}
}

@State<UiSettings>({
  name: 'ui',
  defaults: {
    wireframe: true,
    preview: true,
    availablePages: [],
    currentLayer: null,
    previousLayer: null,
    currentPage: null,
    zoomLevel: 1,
    is3dView: false
  },
  children: [PageState]
})
export class UiState {
  constructor(private snackBar: MatSnackBar) {}

  @Selector()
  static isWireframe(ui: UiSettings) {
    return ui.wireframe;
  }

  @Selector()
  static isPreview(ui: UiSettings) {
    return ui.preview;
  }

  @Selector()
  static currentPage(ui: UiSettings) {
    return ui.currentPage;
  }

  @Selector()
  static autoFixCurrentPagePosition(ui: UiSettings) {
    return ui.currentPage;
  }

  @Selector()
  static currentLayer(ui: UiSettings) {
    return ui.currentLayer;
  }

  @Selector()
  static availablePages(ui: UiSettings) {
    return ui.availablePages;
  }

  @Selector()
  static isSettingsEnabled(ui: UiSettings) {
    return ui.settingsEnabled;
  }
  @Selector()
  static zoomLevel(ui: UiSettings) {
    return ui.zoomLevel;
  }
  @Selector()
  static is3dView(ui: UiSettings) {
    return ui.is3dView;
  }

  @Action(ShowPreview)
  showPreview({ patchState }: StateContext<UiSettings>) {
    patchState({
      preview: true
    });
  }

  @Action(HidePreview)
  hidePreview({ patchState }: StateContext<UiSettings>) {
    patchState({
      preview: false
    });
  }

  @Action(ShowWireframe)
  showWireframe({ patchState }: StateContext<UiSettings>) {
    patchState({
      wireframe: true
    });
  }

  @Action(HideWireframe)
  hideWireframe({ patchState }: StateContext<UiSettings>) {
    patchState({
      wireframe: false
    });
  }

  @Action(AvailablePages)
  setAvailablePages({ patchState }: StateContext<UiSettings>, action: AvailablePages) {
    patchState({
      availablePages: [...action.pages]
    });
  }

  @Action(CurrentPage)
  currentPage({ patchState, dispatch }: StateContext<UiSettings>, action: CurrentPage) {
    patchState({
      currentPage: action.page ? { ...action.page } : null
    });

    if (action.page.name === 'Symbols') {
      dispatch(new HidePreview());
    } else {
      dispatch(new ShowPreview());
    }
  }

  @Action(CurrentLayer)
  currentLayer({ getState, patchState }: StateContext<UiSettings>, action: CurrentLayer) {
    patchState({
      currentLayer: action.layer ? { ...action.layer } : null,
      previousLayer: { ...getState().currentLayer }
    });

    console.log(action.layer);
  }

  @Action(SettingsEnabled)
  enableSettings({ patchState }: StateContext<UiSettings>, action: SettingsEnabled) {
    patchState({
      settingsEnabled: true
    });
  }

  @Action(AutoFixCurrentPagePosition)
  autoFixLayersPosition({ patchState }: StateContext<UiSettings>, action: AutoFixCurrentPagePosition) {
    const currentPage = { ...action.page };

    // reset the top/left position of the current page
    // and the root layers
    currentPage.frame.x = 0;
    currentPage.frame.y = 0;

    patchState({
      currentPage
    });

    this.snackBar
      .open('Fixed Layers Positions', '', {
        duration: 3000
      })
      .onAction()
      .subscribe(() => {
        console.log('todo: The UNDO action was triggered!');
      });
  }

  @Action(ZoomIn)
  zoomIn({ getState, setState }: StateContext<UiSettings>, action: ZoomIn) {
    const ui = { ...getState() };
    ui.zoomLevel = parseFloat((ui.zoomLevel + action.value).toFixed(2));
    if (ui.zoomLevel <= 3) {
      setState(ui);
    }
  }
  @Action(ZoomOut)
  zoomOut({ getState, setState }: StateContext<UiSettings>, action: ZoomOut) {
    const ui = { ...getState() };
    ui.zoomLevel = parseFloat((ui.zoomLevel - action.value).toFixed(2));
    if (ui.zoomLevel >= 0.1) {
      setState(ui);
    }
  }
  @Action(Toggle3D)
  toggle3D({ patchState, dispatch }: StateContext<UiSettings>, action: Toggle3D) {
    if (action.value) {
      dispatch([new ShowPreview(), new ShowWireframe()]);
    }

    patchState({
      is3dView: action.value
    });

  }
}