import type { Course } from "../models/lo-types";
import type { TokenResponse } from "./auth";

export interface analytics{
    learningEvent(params: Record<string, string>, session: TokenResponse) : void;
    updatePageCount(session: TokenResponse) : void;
    getOnlineStatus(course: Course, session: TokenResponse): Promise<string>;
    setOnlineStatus(status: boolean, session: TokenResponse): void;
    
}