export const trackPage = ({title, ...other}) => {
    if (process.env.NODE_ENV !== 'production') {
        window.gtag("event", "page_view", {
            page_title: title,
            ...other
        });
    }
}