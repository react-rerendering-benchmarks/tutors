export declare const imageTypes: string[];
export declare const assetTypes: string[];
export interface VideoIdentifier {
    service: string;
    id: string;
}
export interface VideoIdentifiers {
    videoid: string;
    videoIds: VideoIdentifier[];
}
export interface LearningResource {
    courseRoot: string;
    route: string;
    id: string;
    lrs: LearningResource[];
    files: Array<string>;
    type: string;
}
