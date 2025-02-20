import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import GlobalStyles from '@src/styles/GlobalStyles';


const styles = StyleSheet.create({
	root: {
		//backgroundColor: '#f005',
	},
	rootDark: {
		flexDirection: 'column',
		justifyContent: 'flex-end',
		alignItems: 'flex-start',
		borderBottomWidth: 1,
		borderColor: GlobalStyles.color.GREY4,
		height: 50,
	},
	fullWidth: {
		width: '100%',
	},
	placeholderLight: {
		color: GlobalStyles.color.GREY3,
	},
	placeholderDark: {
		color: GlobalStyles.color.PINK,
		textTransform: 'uppercase',
		fontSize: 12,
		padding: 0,
		margin: 0,
		textAlign: 'left',
	},
	inputLight: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		//borderWidth: 1,
		borderRadius: 5,
		height: 46,
		borderColor: GlobalStyles.color.WHITE,
		color: GlobalStyles.color.GREY1,
		backgroundColor: GlobalStyles.color.WHITE,
		fontSize: 12,
		fontFamily: 'NotoSans-SemiBold',
		fontWeight: '300',
	},
	inputDark: {
		height: 35,
		color: GlobalStyles.color.WHITE,
		padding: 0,
		margin: 0,
		fontSize: 14,
	}
});

type Theme = 'light'
	| 'dark';

interface Props {
	fullWidth: boolean;
	theme: Theme;
};

type State = {};


export default class Input extends Component<Props, State> {
    render() {
		const { style = {}, inputStyle = {}, theme, fullWidth, value, placeholder, nativePlaceholder, ...rest } = this.props;
		let _inputStyle = {};
		let placeholderTextColor;
		let nativePlaceholderSet;
		let placeholderStyle;
		let rootStyle = [styles.root, style];

		if(fullWidth)
			rootStyle.push(styles.fullWidth);

		if(typeof align === 'string')
			globalStyle.textAlign = align;


		if(theme === 'light') {
			placeholderTextColor = GlobalStyles.color.PRIMARY,
			_inputStyle = styles.inputLight;
			placeholderStyle = styles.placeholderLight;
			nativePlaceholderSet = nativePlaceholder ? nativePlaceholder : '';
		}
		else {
			placeholderTextColor = GlobalStyles.color.PINK
			_inputStyle = styles.inputDark;
			placeholderStyle = styles.placeholderDark;
			nativePlaceholderSet = placeholder;
			rootStyle.push(styles.rootDark);
		}

        return (
			<View style={rootStyle}>
				{(!!value || theme === 'light') && <Text style={placeholderStyle}>{placeholder}</Text>}
				<TextInput
					{...rest}
					value={value}
					style={[_inputStyle, inputStyle]}
					placeholder={nativePlaceholderSet}
					placeholderTextColor={placeholderTextColor}
					autoCapitalize="none"
					underlineColorAndroid="transparent"
				/>
			</View>
        );
    };
}
