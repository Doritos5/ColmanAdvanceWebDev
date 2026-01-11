import initApp from "./app";

dotenv.config();

const port = process.env.PORT || 3000;

initApp().then((app) => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Export initApp to satisfy any external requirements
export default initApp;