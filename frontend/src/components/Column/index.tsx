import React from "react";

type ColumnLayoutProps = {
  numColumns: 1 | 2 | 3 | 4;
  widths: [number, number?, number?, number?];
  children: React.ReactNode[];
};

const ColumnLayout: React.FC<ColumnLayoutProps> = ({
  numColumns,
  widths,
  children,
}) => {
  // Validate widths array
  const validatedWidths = widths.slice(0, numColumns).map((width) => {
    if (width === undefined || width < 1 || width > 12) {
      console.error("Width should be between 1 and 12");
      return 1;
    }
    return width;
  });

  // Generate the column styles
  const columns = validatedWidths.map((width, index) => (
    <div key={index} style={{ flex: width }}>
      {children[index]}
    </div>
  ));

  return <div style={{ display: "flex" }}>{columns}</div>;
};

export default ColumnLayout;
