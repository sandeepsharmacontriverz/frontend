import React from 'react';
import { Tree as RD3Tree } from 'react-d3-tree';
import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';

interface TreeChartProps {
  data: any;
}

const renderForeignObjectNode = (props: any) => {
  const {
    nodeDatum, hierarchyPointNode
  } = props;
  const { depth } = hierarchyPointNode;
  const isRoot = depth === 0;
  const width = nodeDatum.width;
  const height = nodeDatum.height;
  const X = -(width / 2);
  const Y = -(height / 2);


  const Base = (props: any) => {
    const { children } = props;
    return <g>
      <foreignObject
        width={width}
        height={height}
        x={X}
        y={Y}
      >
        {children}
      </foreignObject>
    </g>
  }


  const renderRoot = () => {
    return nodeDatum.isRoot ? <p className="text-[13px] font-medium" style={{ marginTop: 8, marginBottom: 8, background: isRoot ? 'blue' : '#fff', padding: '6px', color: isRoot ? 'white' : '#000', textAlign: 'center', ...isRoot ? {} : { border: "1px solid black" } }}>{nodeDatum.name}</p> : null;
  }

  if (nodeDatum.type == "spinner_image") {
    return <Base>
      {/* {renderRoot()} */}
      {renderRoot()}
      <img src="/images/spinner.png" style={{ width: 50, height: 50, marginLeft: 125 }} />
    </Base>
  }

  if (nodeDatum.type == "knitter_image") {
    return <Base>
      {renderRoot()}
      <img src="/images/knitter.png" style={{ width: 50, height: 50, marginLeft: 125 }} />
    </Base>
  }

  if (nodeDatum.type == "weaver_image") {
    return <Base>
      {renderRoot()}
      <img src="/images/knitter.png" style={{ width: 50, height: 50, marginLeft: 125 }} />
    </Base>
  }

  if (nodeDatum.type == "cotton_image") {
    return <Base>
      {renderRoot()}
      <img src="/images/cotton.png" style={{ width: 50, height: 50, marginLeft: height == 50 ? 0 : 125 }} />
    </Base>
  }

  if (nodeDatum.type == "village_image") {
    return <Base>
      <img src="/images/village.png" style={{ width, height }} />
    </Base>
  }

  if (nodeDatum.type == "fabric_image") {
    return <Base>
      {renderRoot()}
      <img src="/images/fabric.png" style={{ width: 50, height: 50, marginLeft: 125 }} />
    </Base>
  }


  if (nodeDatum.type == "garment_image") {
    return <Base>
      {renderRoot()}
      <img src="/images/garment.png" style={{ width: 50, height: 50, marginLeft: 125 }} />
    </Base>
  }


  return <Base>
    <div style={{ border: "1px solid black", background: '#fff' }}>
      {nodeDatum.list ?
        <ul style={{ padding: '10px' }}>
          <p className="text-[13px] font-normal">{nodeDatum.intro}</p>
          {nodeDatum.list.map((el: any) => {
            return <li key={el}>
              <p className="text-[12px] font-normal">&#8226; {el}</p>
            </li>
          })}
        </ul> :
        <div>
          <p className="text-[13px] font-medium" style={{ textAlign: 'center', padding: '6px' }}>{nodeDatum.name}</p>
        </div>
      }
    </div>
  </Base>
}

const TreeChart: React.FC<TreeChartProps> = ({ data }) => {
  const nodeSize = { x: 100, y: 40 };
  const foreignObjectProps = {};
  const straightPathFunc = (linkDatum: any, orientation: any) => {
    const { source, target } = linkDatum;
    return orientation === 'horizontal'
      ? `M${source.y},${source.x}L${target.y},${target.x}`
      : `M${source.x},${source.y + (source.data.height / 2 + 10)}L${target.x},${target.y - (target.data.height / 2 + 20)}`;
  };

  // Customizing the path connecting each node
  React.useEffect(() => {
    setTimeout(() => {
      var svg = document.getElementsByClassName('rd3t-svg');
      var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      // Create the marker element
      var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'arrow');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '10');
      marker.setAttribute('refX', '0');
      marker.setAttribute('refY', '3');
      marker.setAttribute('orient', 'auto');
      marker.setAttribute('markerUnits', 'strokeWidth');

      // Create the arrow path
      var arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
      arrowPath.setAttribute('fill', '#000');

      // Append the arrow path to the marker
      marker.appendChild(arrowPath);

      // Append the marker to the defs
      defs.appendChild(marker);

      // Append the defs to the SVG
      svg[0].appendChild(defs);
      var paths = svg[0].querySelectorAll('path');
      for (var i = 0; i < paths.length; i++) {
        paths[i].setAttribute('marker-end', 'url(#arrow)');
      }
    }, 500);
  }, []);

  const exportToPdf = () => {
    const input: any = document.getElementById('tree-chart');

    htmlToImage.toCanvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('chart-report.pdf');
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
      });
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <div style={{width: '100%', justifyContent: 'flex-end', display: 'flex'}}>
        <button
          className=" py-1.5 px-4 rounded bg-yellow-500 text-white font-bold text-sm"
          onClick={exportToPdf}
        >
          Export to PDF
        </button>
      </div>
      <div id="tree-chart" style={{ width: '100%', height: '70vh' }}>
        <RD3Tree
          data={data}
          orientation="vertical"
          pathFunc={straightPathFunc}
          renderCustomNodeElement={(rd3tProps) =>
            renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
          }
          translate={{
            x: 500,
            y: 100
          }}
        ></RD3Tree>
      </div>
    </div>
  );
};

export default TreeChart;