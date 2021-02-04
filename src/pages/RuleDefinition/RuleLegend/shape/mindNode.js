const WRAPPER_CLASS_NAME = 'node-wrapper';
const WRAPPER_STROKE = 'rgba(0, 0, 0, 0.1)';
export default G6 => {
  G6.registerNode(
    'mind-node',
    {
      draw(cfg, group) {
        const { name = '', rank, collapsed } = cfg;
        const rectConfig = {
          width: 160,
          height: 60,
          lineWidth: 1,
          fontSize: 12,
          fill: '#fff',
          radius: 4,
          stroke: WRAPPER_STROKE,
          opacity: 1,
          cursor: 'pointer',
          modelId: cfg.id,
        };

        const nodeOrigin = {
          x: -rectConfig.width / 2,
          y: -rectConfig.height / 2,
        };

        const textConfig = {
          textAlign: 'left',
          textBaseline: 'bottom',
        };

        const rect = group.addShape('rect', {
          className: WRAPPER_CLASS_NAME,
          attrs: {
            x: nodeOrigin.x,
            y: nodeOrigin.y,
            ...rectConfig,
          },
        });

        const rectBBox = rect.getBBox();

        // label title
        group.addShape('text', {
          attrs: {
            ...textConfig,
            x: 12 + nodeOrigin.x,
            y: 20 + nodeOrigin.y,
            text: name.length > 20 ? `${name.substr(0, 20)}...` : name,
            fontSize: 12,
            opacity: 0.85,
            fill: '#000',
          },
          name: 'name-shape',
        });

        // priority
        group.addShape('text', {
          attrs: {
            ...textConfig,
            x: 12 + nodeOrigin.x,
            y: rectBBox.maxY - 12,
            text: rank || '',
            fontSize: 16,
            fill: '#000',
            opacity: 0.85,
          },
        });

        // collapse rect
        if (cfg.children && cfg.children.length) {
          group.addShape('rect', {
            attrs: {
              x: rectConfig.width / 2 - 8,
              y: -8,
              radius: 8,
              width: 16,
              height: 16,
              stroke: 'rgba(0, 0, 0, 0.25)',
              cursor: 'pointer',
              fill: '#fff',
            },
            name: 'collapse-back',
            modelId: cfg.id,
          });

          // collpase text
          group.addShape('text', {
            attrs: {
              x: rectConfig.width / 2,
              y: -1,
              textAlign: 'center',
              textBaseline: 'middle',
              text: collapsed ? '+' : '-',
              fontSize: 16,
              cursor: 'pointer',
              fill: 'rgba(0, 0, 0, 0.25)',
            },
            name: 'collapse-text',
            modelId: cfg.id,
          });
        }

        this.drawLinkPoints(cfg, group);
        return rect;
      },
      update(cfg, item) {
        const group = item.getContainer();
        this.updateLinkPoints(cfg, group);
      },
      setState(name, value, item) {
        const group = item.getContainer();
        const states = item.getStates();
        if (name === 'collapse') {
          const collapseText = group.find(e => e.get('name') === 'collapse-text');
          if (collapseText) {
            if (!value) {
              collapseText.attr({
                text: '-',
              });
            } else {
              collapseText.attr({
                text: '+',
              });
            }
          }
        }
        if (name === 'active' && states.indexOf('selected') === -1) {
          const wrapperShape = group.findByClassName(WRAPPER_CLASS_NAME);
          if (value) {
            wrapperShape.attr({
              stroke: '#91d5ff',
            });
          } else {
            wrapperShape.attr({
              stroke: WRAPPER_STROKE,
              shadowBlur: 0,
            });
          }
        }
        if (name === 'selected') {
          const wrapperShape = group.findByClassName(WRAPPER_CLASS_NAME);
          if (value) {
            wrapperShape.attr({
              stroke: '#1890ff',
              shadowBlur: 10,
              shadowColor: 'rgb(95, 149, 255)',
            });
          } else {
            wrapperShape.attr({
              stroke: WRAPPER_STROKE,
              shadowBlur: 0,
            });
          }
        }
      },
      getAnchorPoints() {
        return [
          [0, 0.5],
          [1, 0.5],
        ];
      },
    },
    'rect',
  );
};
