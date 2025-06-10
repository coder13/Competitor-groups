import classNames from 'classnames';
import { forwardRef, ForwardRefRenderFunction } from 'react';

export type GridProps = React.HtmlHTMLAttributes<HTMLDivElement> & {
  columnWidths?: string[] | string;
  rowHeights?: string[] | string;
};

const GridForwardRefRenderFunction: ForwardRefRenderFunction<HTMLDivElement, GridProps> = (
  { className, style, columnWidths, rowHeights, ...props }: GridProps,
  ref,
) => {
  return (
    <div
      ref={ref}
      className={classNames('grid', className)}
      style={{
        ...(columnWidths && {
          gridTemplateColumns:
            typeof columnWidths === 'string' ? columnWidths : columnWidths.join(' '),
        }),
        ...(rowHeights && {
          gridTemplateRows: typeof rowHeights === 'string' ? rowHeights : rowHeights.join(' '),
        }),
        ...style,
      }}
      {...props}>
      {props.children}
    </div>
  );
};

export const Grid = forwardRef(GridForwardRefRenderFunction);
