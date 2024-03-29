import styles from "./styles/ShowTool.module.css";
import { Icon } from "@iconify/react";

import FontStyle from "./utils/fontStyle";
import CreateElements from "./utils/createElements";
import ImportElement from "./utils/importElement";
import MoreOptions from "./utils/moreOptions";

function ShowTool({ showing, elements }) {

  if (showing == "more-horiz") {
    return <MoreOptions />;
  }

  if (showing == "text-size") {
    return <FontStyle />
  }

  if (showing == "frame-simple") {
    return <CreateElements />
  }
  if (showing == "media-image") {
    return <>d</>;
  }
  if (showing == "bounce-right") {
    return <>e</>;
  }
  if (showing == "intersect") {
    return <>f</>;
  }
  if (showing == "cloud-upload") {
    return <ImportElement />
  }
  if (showing == "up-round-arrow") {
    return <>h</>;
  }
  if (showing == "question-mark-circle") {
    return <>i</>;
  }
}

export { ShowTool };
