import { createContext, useState } from "react"

export interface IVideo{
    videoDuration: number,
    setVideoDuration: (duration:number) => void,
    trimStart: number, 
    setTrimStart: (duration:number) => void,
    trimEnd: number, 
    setTrimEnd: (duration:number) => void,
    imagePath:string[], 
    setImagePath:(imagePath:string[]) => void,
    showTime:string, 
    setShowTime: (showTime:string) => void,
    isPaush:boolean, 
    setIsPaush: (isPaush:boolean) => void,
}

export const VideoContext = createContext<IVideo|null>(null);

interface Props{
    children: React.ReactNode
}
const VideoProvider:React.FC<Props> = ({children}:Props)=>{
    const [videoDuration, setVideoDuration] = useState(0);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [imagePath, setImagePath] = useState<string[]>([]);
    const [showTime, setShowTime] = useState('--:--');
    const [isPaush, setIsPaush] = useState(true);
    
    return <VideoContext.Provider value={{
        videoDuration,
        setVideoDuration,
        trimStart, 
        setTrimStart,
        trimEnd, 
        setTrimEnd,
        imagePath, 
        setImagePath,
        showTime, 
        setShowTime,
        isPaush: isPaush, 
        setIsPaush: setIsPaush
    }}
    >
        {children}
    </VideoContext.Provider>
}

export default VideoProvider;