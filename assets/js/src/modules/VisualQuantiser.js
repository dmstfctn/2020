/*
  $ele: // [Required] wrapper element to apply height to
  $units: // [Required] the units / lines / contents
  $inset: // [Optional] element/s to measure to take away from available space (e.g. NOW line)
*/

const VisualQuantiser = function( $ele, $units, $_inset ){
  const $inset = $_inset || false;  
  const unitCount = $units.length;
  const unitSize = $units[0].getBoundingClientRect().height;
  let availableSpace = window.innerHeight;
  if( $inset ){
    let was = $inset.style.display;
    $inset.style.display = 'block';
    availableSpace -= $inset.getBoundingClientRect().height;
    $inset.style.display = was;
  }
  const bottom = $ele.getBoundingClientRect().bottom;
  console.log( bottom, availableSpace );
  if( bottom >= availableSpace ){
    const overflow = bottom - availableSpace;
    const overflowUnitCount = Math.ceil( overflow / unitSize );
    console.log( 'overflow: ', overflowUnitCount, ' is ', overflowUnitCount, ' units' );
    const maxUnits = unitCount - overflowUnitCount;
    console.log('max displayable: ', maxUnits )
    $units.forEach(function( $ele, index ){
      if( index >= maxUnits ){
        $ele.style.opacity = 0;
        $ele.style.pointerEvents = 'none';
      } else {
        $ele.style.opacity = '';
        $ele.style.pointerEvents = '';
      }
    });
  } else {
    $units.forEach(function( $ele, index ){
      $ele.style.opacity = '';
      $ele.style.pointerEvents = '';
    });
  }
}

module.exports = VisualQuantiser;