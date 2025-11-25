declare module 'react-native-audio' {
  export const AudioRecorder: {
    prepareRecordingAtPath: (path: string, options: any) => void;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    onFinished: (data: any) => void;
  };

  export const AudioUtils: {
    DocumentDirectoryPath: string;
    MainBundlePath: string;
    CachesDirectoryPath: string;
  };
}

