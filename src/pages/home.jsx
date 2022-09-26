import styles from '../styles/Home.module.css';
import Head from "next/head";
import { withProtected } from '../hook/route';
import Nav from '../component/nav';

function Home({ auth }) {
    const { logout, user } = auth

    return (
        <div className={styles.container}>
            <Head>
                <title>Criata - Home</title>
            </Head>
            <Nav />
            <main style={styles.main}>
                <img src="./assets/images/home/bg.svg" alt="background" className={styles.background} />
                <span className={styles.welcome}>
                    <h1>Crie o seu próprio design!</h1>
                    <p>e use um dos h de exemplo para inspiração</p>
                </span>
            </main>
        </div>
    )
}

export default withProtected(Home);