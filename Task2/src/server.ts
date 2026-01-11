import initApp from "./app";


const PORT = process.env.PORT;

initApp().then((app) => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});