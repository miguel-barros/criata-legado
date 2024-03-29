import Head from "next/head";
import Link from "next/link";
import * as PIXI from "pixi.js";
import { Icon } from "@iconify/react";
import { useState, useEffect, useLayoutEffect, createContext } from "react";
import { withProtected } from "../hook/route";
import styles from "../styles/Creation.module.css";
import { ShowTool } from "../component/showTool";
import PublishModal from "../component/publishModal";
import Storage from "../services/Storage";
import Swal from "sweetalert2";

export const CreationContext = createContext();

function Creation({ auth }) {
  // Gerar ferramentas

  const [elementSelected, setElementSelected] = useState(null);
  const { user } = auth;

  const topTools = [
    "nav-arrow-left",
    "nav-arrow-right",
    "download",
    "trash",
    "erase",
    "divide-selection-2",
    "more-vert",
  ];

  const sideTools = [
    "more-horiz",
    "text-size",
    "frame-simple",
    "media-image",
    "bounce-right",
    "intersect",
    "star-outline",
    "cloud-upload",
    "question-mark-circle",
  ];


  const sideToolsText = [
    "Mais ações",
    "Texto",
    "Elementos",
    "Imagens",
    "Animações",
    "Fundo",
    "Efeitos",
    "Importar",
    "Ajuda",
  ];

  const [toolShowing, setToolShowing] = useState("text-size");
  const [app, setApp] = useState(null);
  const [container, setContainer] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    let tools = document.querySelectorAll(".tool");
    tools.forEach((e) => {
      e.classList.remove("active");
      e.style.backgroundColor = "transparent";
      e.children[0].style.color = "#00000050";
      e.children[1].style.color = "#00000050";
      if (e.id === toolShowing) {
        e.classList.add("active");
        e.style.backgroundColor = "#f5f5f5";
        e.children[0].style.color = "#000";
        e.children[1].style.color = "#000";
      }
    })
  }, [toolShowing])

  useEffect(() => {
    const timer = setInterval(() => {
      setContainer(document.getElementById("Stage"));
      setContainerWidth(document.getElementById("Stage").offsetWidth);
      setContainerHeight(document.getElementById("Stage").offsetHeight);
      clearInterval(timer);
    }, 0);
  }, []);

  useEffect(() => {
    if (container) {
      if (!app) {
        const app = new PIXI.Application({
          width: containerWidth,
          height: containerHeight,
          backgroundAlpha: "0",
          resolution: window.devicePixelRatio || 1,
        });
        setApp(app);
        container.appendChild(app.view);
      }
    }
  }, [container]);

  // Funções de criação de elementos

  let elements = [];


  // function handleTopClick(e) {
  //   if (e === "trash" && elementSelected) { // Deletar elemento
  //     app.stage.removeChild(elementSelected);
  //     setElementSelected(null);
  //   }
  //   if (e == "download") { // Salvar elemento em json
  //     app.stage.children.forEach((child) => {
  //       elements.push({
  //         name: child.name,
  //         x: child.x,
  //         y: child.y,
  //         width: child.width,
  //         height: child.height,
  //         rotation: child.rotation,
  //         text: child.text,
  //         style: child.style,
  //         anchor: child.anchor,
  //         texture: child.texture,
  //       });
  //     });

  //     alert("Salvo com sucesso!");
  //     // let blob = new Blob([data], { type: "application/json" });
  //     // let url = URL.createObjectURL(blob);
  //     // let a = document.createElement('a');
  //     // a.download = "project.json";
  //     // a.href = url;
  //     // a.click();
  //   }
  // }

  async function handleTopClick(e) {
    if (e === "trash" && elementSelected) { // Deletar elemento
      app.stage.removeChild(elementSelected);
      setElementSelected(null);
    }
    if (e == "download") { // Salvar elemento em json
      const url = await app.renderer.extract.base64(app.stage);
      const blob = await fetch(url).then(r => r.blob());
      const file = new File([blob], "curriculo.png", { type: "image/png" });
      Storage.uploadFile(user.uid, file).then((res) => {
        console.log(res);
      })
      saveScene();
    }
  }

  async function saveScene() {
    const url = await app.renderer.extract.base64(app.stage);
    const blob = await fetch(url).then(r => r.blob());
    const file = new File([blob], "curriculo.png", { type: "image/png" });
    Storage.uploadFile(user.uid, file)
  }

  let selectedElement = null;

  const selectElement = (element) => {
    if (selectedElement && selectedElement != element) {
      selectedElement.alpha = 1;
      selectedElement.interactive = false;
      selectedElement.buttonMode = false;
      selectedElement = null;
      setElementSelected(null);
    }
    if (selectedElement == element) {
      selectedElement.alpha = 1;
      selectedElement.interactive = false;
      selectedElement.buttonMode = false;
      selectedElement = null;
      setElementSelected(null);
    } else {
      selectedElement = element;
      setElementSelected(selectedElement);
      selectedElement.alpha = 0.5;
      selectedElement.interactive = true;
      selectedElement.buttonMode = true;
      selectedElement.cursor = "move";
      showElementProps(selectedElement);
    }
  };

  let elementProps = {};

  const showElementProps = (e) => {
    return elementProps = getElementProps(e)
  }

  const getElementProps = (element) => {
    return element.getBounds()
  }


  const onMove = (container, element) => {
    if (!element.grabbing) {
      if (element == selectedElement) {
        element.grabbing = true;
        element.on("mousedown", () => {
          element.on("mousemove", () => {
            element.cursor = "move";
            element.alpha = 0.5;
            element.position = {
              x: container.data.global.x - element.width / 2,
              y: container.data.global.y - element.height / 2,
            };
          });
        });
      }
    } else {
      element.grabbing = false;
      element.off("mousemove");
      element.cursor = "default";
      element.alpha = 1;
    }
  };

  useLayoutEffect(() => {
    if (app) {
      const stage = app.stage;
      app.view.addEventListener("mousedown", () => {

        if (selectedElement) { // se clicar fora do elemento, deselecionar
          selectedElement.alpha = 1;
          selectedElement.interactive = false;
          selectedElement.buttonMode = false;
          selectedElement = null;
          setElementSelected(null);
        }

        // verifica o click dentro do view
        stage.interactive = true;
        let locked = false;

        // verifica se o click foi dentro de algum elemento
        stage.children.forEach((child) => {
          if (locked) return null;
          child.interactive = true;
          child.on("pointerup", (e) => {
            selectElement(child);
            onMove(e, child);
            locked = true;
          });
        });

        document.addEventListener("keydown", (e) => {
          if (selectedElement) {
            if (e.key == "Shift") {
              if (selectedElement.text) {
                Swal.fire({
                  customClass: {
                    container: styles.swal,
                  },
                  title: "Digite o texto",
                  input: "text",
                  inputValue: selectedElement.text,
                  showCancelButton: false,
                  showConfirmButton: true,
                  inputValidator: (value) => {
                    if (!value) {
                      return "Você precisa digitar algo!";
                    }
                  },
                }).then((result) => {
                  if (result.isConfirmed) {
                    selectedElement.text = result.value;
                    selectElement(selectedElement);
                  }
                });
              }
              selectedElement.editing = false;
            }
            if (e.key === "ArrowUp") {
              selectedElement.position.y -= 10;
            }
            if (e.key === "ArrowDown") {
              selectedElement.position.y += 10;
            }
            if (e.key === "ArrowLeft") {
              selectedElement.position.x -= 10;
            }
            if (e.key === "ArrowRight") {
              selectedElement.position.x += 10;
            }
            if (e.key === "Delete") {
              app.stage.children.forEach((child) => {
                if (child.name === selectedElement.name) {
                  app.stage.removeChild(child);
                  setElementSelected(null);
                }
              });
            }
          }
        });
      });
    }
  }, [app]);

  const [publishModal, setPublishModal] = useState(false);

  return (
    <CreationContext.Provider value={{ app, elements, elementSelected, getElementProps, elementProps }}>
      <div className={styles.container}>
        <Head>
          <title>Criata - Criação</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <PublishModal showing={publishModal} onClose={() => setPublishModal(false)} publish={() => saveScene()} />
        <header className={styles.header}>
          <Link href="/">
            <div className={styles.left}>
              <img src="../assets/components/criata_logo.svg" alt="logo" />
              <h2>Criata</h2>
            </div>
          </Link>
          <div className={styles.right}>
            <span className={styles.shortcuts}>
              {topTools.map((e, i) => {
                return (
                  <Icon
                    key={e}
                    icon={`iconoir:${e}`}
                    className={styles.icon}
                    id={e}
                    onClick={() => handleTopClick(e)}
                  />
                );
              })}
            </span>
            <span className={styles.actions}>
              <button onClick={() => setPublishModal(true)}>Publicar</button>
              <button>Visualizar</button>
            </span>
          </div>
        </header>
        <main className={styles.main}>
          <img
            className={styles.background}
            src="./assets/images/creation/background.svg"
            alt="background"
          />
          <div className={styles.side_bar}>
            <div className={styles.tools_header}>
              {sideTools.map((e, index) => {
                return (
                  <span key={e} onClick={() => setToolShowing(e)} className={'tool'} id={e}>
                    <Icon icon={`iconoir:${e}`} className={styles.tool} />
                    <p>{sideToolsText[index]}</p>
                  </span>
                );
              })}
            </div>
            <div className={styles.box}>
              <ShowTool showing={toolShowing} app={app} elements={elements} />
            </div>
          </div>
          <div className={styles.content} id={"Stage"}></div>
        </main>
      </div>
    </CreationContext.Provider>
  );
}

export default withProtected(Creation);
