declare module REactNoop {
  export interface Container {
    rootID: number;
    children: (Instance | TestInstance)[];
  }

  export interface Instance {
    id: number;
    type: string;
    children: (Instance | TestInstance)[];
    parent: number;
    props: React.Props;
  }

  export interface TestInstance {
    text: string;
    id: number;
    parent: number;
  }
}
