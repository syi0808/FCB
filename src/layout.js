
if(typeof window !== "undefined") {
  window.addEventListener("load", () => {
    if(document.getElementById("FCB-Popup-Wrapper")) return;

    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
      #FCB-Popup-Wrapper {
        width: 300px;
        max-height: 360px;
        overflow-y: auto;
        position: fixed;
        top: 0;
        left: 0;
        border-radius: 12px;
        background: white;
        padding: 18px;
        box-shadow: 0px 6px 10px 0px rgba(0, 0, 0, 0.2);
        display: none;
        flex-direction: column;
        gap: 8px;
        color: black;
        font-weight: 600;
        z-index: ${Math.pow(10, 7)};
      }

      .FCB-Active {
        display: flex !important;
      }

      .FCB-Flex {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .FCB-Line {
        width: 100%;
        justify-content: space-between;
        padding: 2px 0;
      }

      .FCB-Column {
        flex-direction: column;
      }

      .FCB-Small {
        font-size: 10px;
        font-weight: 400;
      }

      .FCB-Overlay {
        background: rgb(0, 0, 0, .3);
        position: fixed;
        top: 0;
        left: 0;
        z-index: ${Math.pow(10, 6)};
        pointer-events: none;
      }

      .FCB-Path {
        font-size: 9px;
        word-break: break-all;
      }
    `;

    let isOpen = false;
    let isCtrlPress = false;
    const position = { x: 0, y: 0 };
    const dom = document.createElement("div");
    dom.setAttribute("id", "FCB-Popup-Wrapper");

    const overlay = document.createElement("div");
    overlay.classList.add("FCB-Overlay");

    document.body.appendChild(overlay);
    document.body.appendChild(dom);
    document.head.appendChild(styleTag);

    const log2Information = gitLogs => {
      const map = {};
      gitLogs = Object.entries(gitLogs);

      const total = gitLogs.reduce((prev, [name, log]) => {
        const score = (log[0] * 5) + (log[1] * 2) + log[2];
        map[name] = {
          score,
          percent: null,
        };
        return prev + score;
      }, 0);

      Object.entries(map).forEach(([key, { score }]) => {
        map[key].percent = Math.round((score / total) * 100);
      });

      return map;
    }

    const getInfo = fiber => {
      if(!fiber) return null;
      else if(fiber.elementType?.contInfo || fiber.type?.contInfo) return fiber.elementType || fiber.type;

      return getInfo(fiber._debugOwner);
    }

    const showTargetWithTooltip = () => {
      if(!isOpen) return;
      dom.classList.add("FCB-Active");
      overlay.style.display = "flex";

      const { x, y } = position;
      const { width, height } = dom.getBoundingClientRect();
      let calculatedX = x - width;
      let calculatedY = y - height;
      if(x <= width) calculatedX = x;
      if(y <= height) calculatedY = y;
      dom.style.transform = `translate(${calculatedX}px, ${calculatedY}px)`;

      let target = document.elementsFromPoint(x, y)[1];
      if(!target) return;

      const filterdKey = Object.keys(target).filter(key => key.includes("__reactFiber$"));
      if(!filterdKey.length) return;

      const fiber = target[filterdKey[0]];
      const stateNodeInfo = fiber.stateNode.getBoundingClientRect();
      overlay.style.width = `${stateNodeInfo.width}px`;
      overlay.style.height = `${stateNodeInfo.height}px`;
      overlay.style.transform = `translate(${stateNodeInfo.x}px, ${stateNodeInfo.y}px)`;

      const fiberInfo = getInfo(fiber._debugOwner);
      let gitLogs = fiberInfo?.contInfo;
      if(!gitLogs) return;
      gitLogs = Object.fromEntries(
        Object.entries(gitLogs).filter(([_, log]) => {
          if(log[0] || log[1] || log[2]) return true;
          else return false;
        })
      );
      const info = log2Information(gitLogs);
      
      if(Object.keys(gitLogs).length) {
        dom.innerHTML = `
          <span class="FCB-Path">${fiberInfo.path}</span>
          ${
            Object.entries(gitLogs).sort((a, b) => info[b[0]].score - info[a[0]].score).map(([name, log]) => `
              <div class="FCB-Flex FCB-Column">
                <div class="FCB-Flex FCB-Line">
                  <span>${name}</span>
                  <span>${info[name].percent}%</span>
                </div>
                <div class="FCB-Flex FCB-Line">
                  <span class="FCB-Small">${log[0]} file changes</span>
                  <span class="FCB-Small">${log[1]} lines added</span>
                  <span class="FCB-Small">${log[2]} lines deleted</span>
                </div>
              </div>
            `).join("")
          }
        `;
      } else dom.innerHTML = "NOT FOUND";
    }

    const hideTooltip = () => {
      dom.classList.remove("FCB-Active");
      overlay.style.display = "none";
    }

    window.addEventListener("keydown", e => {
      // alt + space
      if(e.altKey && e.keyCode === 32) {
        isOpen = !isOpen;
        if(!isOpen) hideTooltip();
        else showTargetWithTooltip();
      }
      if(e.keyCode === 17) {
        isCtrlPress = true;
      }
    });

    window.addEventListener("keyup", e => {
      if(e.keyCode === 17) {
        isCtrlPress = false;
      }
    });

    window.addEventListener("mousemove", e => {
      position.x = e.clientX;
      position.y = e.clientY;
      showTargetWithTooltip();
    });

    dom.addEventListener("mousemove", e => {
      if(isCtrlPress) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });
};
