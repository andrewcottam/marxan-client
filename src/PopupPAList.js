import React from 'react';
import ReactTable from "react-table";
import Sync from 'material-ui/svg-icons/notification/sync';

class PopupPAList extends React.Component {
	render() {
		let left = this.props.xy.x + 25 + 'px';
		let top = this.props.xy.y - 25 + 'px';
		return (
			<div style={{'display': this.props.features && this.props.features.length > 0 ? 'block' : 'none', 'left': left,'top':top}} id="popup">
				<div className={'popupHeader'}>Protected Areas</div>
				<Sync className='spin' style={{display: this.props.loading ? "inline-block" : "none", color: 'rgb(255, 64, 129)', position: 'absolute', top: '5px', right: '7px'}} key={"spinner"}/>
				<ReactTable
					showPagination={false}
					pageSize={(this.props.loading) ? 0 : this.props.features && this.props.features.length}
					minRows={0}
					noDataText=''
					data={this.props.features}
					columns={[{
						 Header: 'Name',
						 accessor: 'name',
						 width: 320,
					},{
						 Header: 'Category',
						 accessor: 'iucn_cat',
						 width: 60,
					}]}
				/>
			</div>
		);
	}
}

export default PopupPAList;