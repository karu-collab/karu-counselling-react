import { Outlet } from "react-router-dom";
import Header from "../components/header/Header.jsx";
import Footer from "../components/footer/Footer.jsx";

function BaseLayout() {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            {/*<elevenlabs-convai user_name="mimi" agent-id="agent_01jyc1hn76ee9v5nm2fzfkayvm"></elevenlabs-convai><script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>*/}
            <Footer />
        </>
    );
}

export default BaseLayout;
