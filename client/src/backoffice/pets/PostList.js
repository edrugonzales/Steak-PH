import * as React from 'react';
import { API } from "../../config";
import { Children, Fragment, cloneElement, memo } from 'react';
import BookIcon from '@material-ui/icons/Book';
import Chip from '@material-ui/core/Chip';
import { useMediaQuery } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import lodashGet from 'lodash/get';
import jsonExport from 'jsonexport/dist';
import {push} from 'react-router-redux';
import {
    BooleanField,
    BulkDeleteButton,
    BulkExportButton,
    ChipField,
    Datagrid,
    DateField,
    downloadCSV,
    EditButton,
    Filter,
    List,
    NumberField,
    ReferenceArrayField,
    SearchInput,
    ShowButton,
    SimpleList,
    SingleFieldList,
    TextField,
    TextInput,
    useTranslate,
    useRefresh,
    showNotification,
    useNotify, useRedirect, Pagination
} from 'react-admin'; // eslint-disable-line import/no-unresolved

import ResetViewsButton from './ResetViewsButton';
export const PostIcon = BookIcon;

const useQuickFilterStyles = makeStyles(theme => ({
    chip: {
        marginBottom: theme.spacing(1),
    },
}));
const QuickFilter = ({ label }) => {
    const translate = useTranslate();
    const classes = useQuickFilterStyles();
    return <Chip className={classes.chip} label={translate(label)} />;
};

const PostFilter = props => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn />
    </Filter>
);

const exporter = posts => {
    const data = posts.map(post => ({
        ...post,
        backlinks: lodashGet(post, 'backlinks', []).map(
            backlink => backlink.url
        ),
    }));
    jsonExport(data, (err, csv) => downloadCSV(csv, 'posts'));
};

const useStyles = makeStyles(theme => ({
    title: {
        maxWidth: '20em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    hiddenOnSmallScreens: {
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
    publishedAt: { fontStyle: 'italic' },
}));

const PostListBulkActions = memo(props => (
    <Fragment>
        <ResetViewsButton {...props} />
        <BulkDeleteButton {...props} />
        <BulkExportButton {...props} />
    </Fragment>
));

const usePostListActionToolbarStyles = makeStyles({
    toolbar: {
        alignItems: 'center',
        display: 'flex',
        marginTop: -1,
        marginBottom: -1,
    },
});

const PostListActionToolbar = ({ children, ...props }) => {
    const classes = usePostListActionToolbarStyles();
    return (
        <div className={classes.toolbar}>
            {Children.map(children, button => cloneElement(button, props))}
        </div>
    );
};


const PostPagination = props => <Pagination rowsPerPageOptions={[10, 25, 50, 100, 500]} {...props} />;


const PostList = props => {
    const refresh = useRefresh();
    const classes = useStyles();
    const notify = useNotify();
    const redirect = useRedirect();
    // const isSmall = useMediaQuery(theme => theme.breakpoints.down('sm'));
    const rowClick = (id, basePath, record) => {
        if(window.confirm(`${(record.isApproved)? `Disapprove '${record.name}'` : `Approve '${record.name}'`}`)) {
            fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/product-approval/${record.id}`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({isApproved: !record.isApproved})
            })
                .then(response => {
                    // showNotification(`${(!record.isApproved)? `Disapprove '${record.name}'` : `Approve '${record.name}'`}`);
                    notify(`${(record.isApproved)? `Disapprove '${record.name}'` : `Approve '${record.name}'`}`, 'warning');
                    redirect('list', props.basePath);
                    refresh();
                    console.log(response.json());
                    push('/');
                })
                .catch(err => {
                    console.log(err);
                });
        } else {
            console.log('Cancel');
        }
        // if (record.commentable) {
        //     return 'edit';
        // }
    
        return;
    };

    function handleStatusChange(e, record) {
      var url = record.images[e.target.value].url
      var index  = e.target.value
      console.log(e.target.value, record.id, record.images[e.target.value].url)
        fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/product-approval/${record.id}`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({imagePrimary: url})
        })
            .then(response => {
                console.log(response.body)
                // showNotification(`${(!record.isApproved)? `Disapprove '${record.name}'` : `Approve '${record.name}'`}`);
                notify(`${record.name} update imagePrimary to Image ${index}`, 'warning');
                redirect('list', props.basePath);
                refresh();
                console.log(response.json());
                push('/');
            })
            .catch(err => {
                console.log(err);
            });
    }

    const showPrimaryImages = o => (
        <div className="form-group">
            {/* <h3 className="mark mb-4">Status: {o.status}</h3> */}
            <select
                className="form-control"
                onChange={e => handleStatusChange(e, o)}
            >
                <option>Assign Primary Image</option>
                {/* <option value="5f8cfc5e93c7210017793840">Barge Gumogda</option>
                <option value="5f87b4656940340017a4a468">Ramil Sison</option> */}
                {o.images.map((image, index) => (
                    <option key={index} value={index}>
                        Image {index}
                    </option>
                ))}
            </select>
        </div>
    );

    const PostPanel = ({ id, record, resource }) => (
        // <div dangerouslySetInnerHTML={{ __html: record.body }} />

        <div>
            {showPrimaryImages(record)}

            {record.images.map((value, index) => {
                console.log(record)
                return(
                <div key={index}>
                    <p>
                        Image {index} 
                        <strong>
                            {(record.imagePrimary == value.url)? ` - Primary Image`: ` `}
                        </strong>
                    </p>
                    <img key={index} width="500" style={{margin: 1 + 'em', border: (value.isApproved)? 'green solid 3px': 'red solid 3px'}} src={value.url} onClick={()=> {
                        fetch(`${(process.env.REACT_APP_API_URL) ? `${API}` : '/api'}/product-approval/image/${value.id}/${record.id}`, {
                            method: "PUT",
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({isApproved: !value.isApproved})
                        })
                            .then(response => {
                                // showNotification(`${(!record.isApproved)? `Disapprove '${record.name}'` : `Approve '${record.name}'`}`);
                                notify(`${(value.isApproved)? `Disapprove image '${value.id}'` : `Approve image '${value.id}'`}`, 'warning');
                                redirect('list', props.basePath);
                                refresh();
                                console.log(response.json());
                                push('/');
                            })
                            .catch(err => {
                                console.log(err);
                            });
                
                    }}/>
                </div>)
            })}
        </div>
    );
    return (
        <List
            {...props}
            bulkActionButtons={<PostListBulkActions />}
            filters={<PostFilter />}
            sort={{ field: 'createdDate', order: 'DESC' }}
            exporter={exporter}

            pagination={<PostPagination/>}

        >
                <Datagrid rowClick={rowClick} expand={PostPanel} optimized>
                    {/* <TextField source="_id" /> */}
                    <TextField source="name" cellClassName={classes.title} />
                    <TextField source="description" />
                    <TextField source="category" />
                    <TextField source="shop" />
                    <TextField source="shopInspiration" />
                    <TextField source="price" />
                    <TextField source="quantity" />
                    <DateField
                        source="createdAt"
                        sortByOrder="DESC"
                        cellClassName={classes.createdDate}
                    />
                    <BooleanField source="isArchived"/>
                    <BooleanField source="isApproved" onClick={()=> {}}/>
{/* 
                    <NumberField source="views" sortByOrder="DESC" />
                    <ReferenceArrayField
                        label="Tags"
                        reference="tags"
                        source="tags"
                        sortBy="tags.name"
                        sort={{ field: 'name', order: 'ASC' }}
                        cellClassName={classes.hiddenOnSmallScreens}
                        headerClassName={classes.hiddenOnSmallScreens}
                    >
                        <SingleFieldList>
                            <ChipField source="name" size="small" />
                        </SingleFieldList>
                    </ReferenceArrayField> */}
                    <PostListActionToolbar>
                        {/* <EditButton />
                        <ShowButton /> */}
                    </PostListActionToolbar>
                </Datagrid>
        </List>
    );
};

export default PostList;
