export type WindowState = "maximise" | "minimize" | "close";

export interface TrendingPoster {
    title:string, 
    img: string, 
    malId:number, 
    score: number, 
    index: number
}