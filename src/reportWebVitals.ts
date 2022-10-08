import { ReportHandler } from 'web-vitals';

const reportWebVitals = (onPerfEntry: ReportHandler | undefined) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      if (onPerfEntry) {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      }
    });
  }
};

export default reportWebVitals;
