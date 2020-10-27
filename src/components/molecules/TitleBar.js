import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Row, Col, Icon, Text, Section } from '../../components';
import GlobalStyles from '../../styles/GlobalStyles';
import translate from "../../locales/i18n";
import { Router, BASE_SCREEN_NAME } from "../../Router";


const styles = StyleSheet.create({
	root: {
		width: '100%',
		height: 68,
		//backgroundColor: '#f005',

	},
	iconLeft: {
		//backgroundColor: '#f005',
		height: '100%',
		paddingEnd: GlobalStyles.section.title.paddingLeft / 2,
		paddingStart: GlobalStyles.section.title.paddingLeft / 2,
		marginLeft: - (GlobalStyles.section.title.paddingLeft)
	},
	iconRight: {
		height: '100%',
		paddingEnd: GlobalStyles.section.title.paddingLeft / 2,
		paddingStart: GlobalStyles.section.title.paddingLeft / 2,
		marginRight: - (GlobalStyles.section.title.paddingLeft / 2)
	}
});

type Theme = 'light' 
	| 'dark';

interface Props {
	theme: Theme;
	onBack: function;
	onSettings: function;
	title: string;
	subtitle: string;
	buttons: Component[];
};

interface State {
	items: MenuItem[]
};


export default class PluginList extends Component<Props, State> {

	render = () => {
		const { 
			style = {}, 
			theme, 
			onBack, 
			onSettings,
			title,
			subtitle,
			buttons
		} = this.props;

		const iconBackName = theme === 'light'
			? 'back_light'
			: 'back_dark';

		const iconSettingsName = theme === 'light'
			? 'settings_light'
			: 'settings_dark';


		return (
			<Section type="title" style={[style]}>
				<Row justify="space-between" align="center" style={styles.root}>
					<Row justify="start" align="center">
						{!!onBack && <TouchableOpacity style={styles.iconLeft} onPress={onBack} >
							<Icon name={iconBackName} />
						</TouchableOpacity>}
						<Col>
							<Text type='title' theme={theme}>{title}</Text>
							{!!subtitle && <Text type='subtitle' theme={theme}>{subtitle}</Text>}
						</Col>
					</Row>
					<Row justify="end" align="center">
						{buttons}
						{!!onSettings && <TouchableOpacity style={styles.iconRight} onPress={onSettings}>
							<Icon name={iconSettingsName} />
						</TouchableOpacity>}
					</Row>
				</Row>
			</Section>
		);
	};
}